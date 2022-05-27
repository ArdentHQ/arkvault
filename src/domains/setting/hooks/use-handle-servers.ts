import { useCallback, useEffect, useState } from "react";
import { Networks } from "@payvo/sdk";
import { Contracts } from "@payvo/sdk-profiles";
import { HttpClient } from "@/app/services/HttpClient";
import { NetworkHostType } from "@/domains/setting/pages/Servers/Servers.contracts";
import {
	addressIsValid as checkIfAddressIsValid,
	getBaseUrl,
	isPeer,
	isMusig,
	urlBelongsToNetwork,
	getServerHeight,
} from "@/utils/peers";

const useHandleServers = ({
	profile,
	address,
	network,
	addressIsValid,
}: {
	profile: Contracts.IProfile;
	address: string;
	network?: Networks.Network;
	addressIsValid: boolean;
	// eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
	const [networkMismatch, setNetworkMismatch] = useState(false);
	const [fetchingDetails, setFetchingDetails] = useState(false);
	const [fetchingError, setFetchingError] = useState(false);
	const [serverType, setServerType] = useState<NetworkHostType | undefined>(undefined);
	const [serverHeight, setServerHeight] = useState<number | undefined>(undefined);
	const baseUrl = checkIfAddressIsValid(address) ? getBaseUrl(address) : undefined;

	const validateAddress = useCallback(async () => {
		const controller = new AbortController();

		const { signal } = controller;

		const client = new HttpClient(0).withOptions({ signal });

		let serverType: "full" | "musig" | undefined;

		try {
			// baseUrl cannot be undefined since this method is only called when
			// the address is valid
			const response = await client.get(baseUrl!);

			const body = JSON.parse(response.body());

			if (isPeer(body)) {
				serverType = "full";
			}

			if (isMusig(body)) {
				serverType = "musig";
			}
		} catch {
			serverType = undefined;
		}

		if (serverType === "full") {
			if (await urlBelongsToNetwork(profile, address, network!)) {
				setServerHeight(await getServerHeight(address));
			} else {
				setNetworkMismatch(true);
			}
		} else {
			setServerHeight(undefined);
		}

		setServerType(serverType);

		if (serverType === undefined) {
			setFetchingError(true);
		}

		setFetchingDetails(false);

		return controller;
	}, [baseUrl, address, network, profile]);

	const shouldFetchAddressType = () => baseUrl !== undefined && !!address && !!network && addressIsValid;

	useEffect(() => {
		let timeout: ReturnType<typeof setTimeout> | undefined;

		let controller: AbortController | undefined;

		setFetchingError(false);

		setServerType(undefined);

		setServerHeight(undefined);

		setNetworkMismatch(false);

		if (!shouldFetchAddressType()) {
			setFetchingDetails(false);
			return;
		}

		setFetchingDetails(true);

		timeout = setTimeout(async () => {
			timeout = undefined;

			controller = await validateAddress();
		}, 1000);

		return () => {
			if (timeout) {
				clearTimeout(timeout);
				timeout = undefined;
			}

			if (controller) {
				controller.abort();
			}
		};
	}, [address, network]);

	return { fetchingDetails, fetchingError, networkMismatch, serverHeight, serverType };
};

export { useHandleServers };
