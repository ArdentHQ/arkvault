import { useCallback, useEffect, useMemo, useState } from "react";
import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import { HttpClient } from "@/app/services/HttpClient";
import {
	addressIsValid as checkIfAddressIsValid,
	getBaseUrl,
	urlBelongsToNetwork,
	getServerHeight,
} from "@/utils/peers";
import { filterArray } from "@/app/lib/helpers/filter-array";

enum Endpoints {
	"PublicApi" = "PublicApi",
	"TransactionApi" = "TransactionApi",
	"EvmApi" = "EvmApi",
}

const useHandleServers = ({
	profile,
	transactionApiEndpoint,
	publicApiEndpoint,
	evmApiEndpoint,
	network,
	addressIsValid,
}: {
	profile: Contracts.IProfile;
	publicApiEndpoint: string;
	transactionApiEndpoint: string;
	evmApiEndpoint: string;
	network?: Networks.Network;
	addressIsValid: boolean;
}) => {
	const [networkMismatch, setNetworkMismatch] = useState(false);
	const [fetchingDetails, setFetchingDetails] = useState(false);
	// const [fetchingErrors, setFetchingErrors] = useState<Record<Endpoints, boolean>>(() => ({
	// 	[Endpoints.PublicApi]: false,
	// 	[Endpoints.TransactionApi]: false,
	// 	[Endpoints.EvmApi]: false,
	// }));
	const [fetchingErrors, setFetchingErrors] = useState(false);
	const [serverHeight, setServerHeight] = useState<number | undefined>(undefined);

	// const setFetchingError = (endpoint: Endpoints, value: boolean) => {
	// 	setFetchingErrors({...fetchingErrors, [endpoint]: value})
	// }

	const validatePublicApi = useCallback(async () => {
		if (await urlBelongsToNetwork(profile, publicApiEndpoint, network!)) {
			setServerHeight(await getServerHeight(publicApiEndpoint));
		} else {
			setNetworkMismatch(true);
		}
	}, [network, profile, publicApiEndpoint]);

	// const validateTransactionApi = useCallback(async (controller: AbortController) => {
	// 	console.log("validateTransactionApi", controller);
	// 	const { signal } = controller;
	//
	// 	const client = new HttpClient(0).withOptions({ signal });
	//
	// 	try {
	// 		const response = await client.get(`${transactionApiEndpoint}/configuration`);
	//
	// 		const body = JSON.parse(response.body());
	//
	// 		if (!body.height) {
	// 			setNetworkMismatch(true);
	// 		}
	// 	} catch {
	// 		setNetworkMismatch(true);
	// 	}
	// }, [transactionApiEndpoint]);

	useEffect(() => {
		console.log("Effect is running", publicApiEndpoint)
		// setFetchingError(Endpoints.PublicApi, false);
		// setFetchingErrors(false)
		setFetchingErrors(false);

		setServerHeight(undefined);

		setNetworkMismatch(false);

		const baseUrl = checkIfAddressIsValid(publicApiEndpoint) ? publicApiEndpoint : undefined;

		const isValid = baseUrl !== undefined && !!publicApiEndpoint && !!network && addressIsValid;

		if (!isValid) {
			setFetchingDetails(false);
			return;
		}

		setFetchingDetails(true);

		async function validate() {
			await validatePublicApi();
			setFetchingDetails(false);
		}

		void validate();
	}, [publicApiEndpoint, network, ]);

	return { fetchingDetails, fetchingError: false, networkMismatch, serverHeight, serverType: undefined };
};

export { useHandleServers };
