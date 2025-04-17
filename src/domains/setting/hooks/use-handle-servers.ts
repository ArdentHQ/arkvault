import { useEffect, useRef, useState } from "react";
import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import { HttpClient } from "@/app/services/HttpClient";
import {
	addressIsValid as checkIfAddressIsValid,
	urlBelongsToNetwork,
	getServerHeight,
} from "@/utils/peers";
import { DeepMap, FieldError } from "react-hook-form";
import { CustomNetwork } from "@/domains/setting/pages/Servers/Servers.contracts";

const useHandleServers = ({
	profile,
	transactionApiEndpoint,
	publicApiEndpoint,
	evmApiEndpoint,
	network,
	errors,
}: {
	profile: Contracts.IProfile;
	publicApiEndpoint: string;
	transactionApiEndpoint: string;
	evmApiEndpoint: string;
	network?: Networks.Network;
	errors: DeepMap<CustomNetwork, FieldError>;
}) => {
	const [networkMismatch, setNetworkMismatch] = useState(false);
	const [fetchingDetails, setFetchingDetails] = useState(false);
	const [isInvalidTransactionApi, setIsInvalidTransactionApi] = useState(false);
	const [isInvalidEvmApi, setIsInvalidEvmApi] = useState(false);

	const [serverHeight, setServerHeight] = useState<number | undefined>(undefined);

	function isValid(url: string, type: string) {
		if (!url || !network || errors[type] !== undefined) {
			return false;
		}

		return checkIfAddressIsValid(url);
	}

	async function validatePublicApi() {
		setServerHeight(undefined);

		setNetworkMismatch(false);

		if (!isValid(publicApiEndpoint, "publicApiEndpoint")) {
			return;
		}

		setFetchingDetails(true);

		if (await urlBelongsToNetwork(profile, publicApiEndpoint, network!)) {
			setServerHeight(await getServerHeight(publicApiEndpoint));
		} else {
			setNetworkMismatch(true);
		}
		setFetchingDetails(false);
	}

	async function validateTransactionApi(controller: AbortController) {
		if (!isValid(transactionApiEndpoint, "transactionApiEndpoint")) {
			return;
		}

		const { signal } = controller;

		const client = new HttpClient(0).withOptions({ signal });

		setFetchingDetails(true);
		setIsInvalidTransactionApi(false);

		try {
			const response = await client.get(`${transactionApiEndpoint}/configuration`);

			const body = JSON.parse(response.body());

			if (!body.data.height) {
				setIsInvalidTransactionApi(true);
			}
		} catch {
			setIsInvalidTransactionApi(true);
		}

		setFetchingDetails(false);
	}

	async function validateEvmApi(controller: AbortController) {
		if (!isValid(evmApiEndpoint, "evmApiEndpoint")) {
			setIsInvalidEvmApi(false);
			return;
		}

		const { signal } = controller;

		const client = new HttpClient(0).withOptions({ signal });

		setFetchingDetails(true);
		setIsInvalidEvmApi(false);

		try {
			const response = await client.post(evmApiEndpoint, {
				id: 1,
				jsonrpc: "2.0",
				method: "eth_call",
				params: [
					{
						data: "0x0000000000000000000000000000000000000000000000000000000000000000",
						to: "0x0000000000000000000000000000000000000000",
					},
					"latest",
				],
			});

			const body = JSON.parse(response.body());

			if(!body.result) {
				setIsInvalidEvmApi(true)
			}
		} catch {
			setIsInvalidEvmApi(true);
		}

		setFetchingDetails(false);
	}

	const controllers = useRef<Record<"transactionApi"|"evmApi", AbortController|undefined>>({
		evmApi: undefined,
		transactionApi: undefined,
	});

	const networkId = network?.id();

	useEffect(() => {
		void validatePublicApi();
	}, [networkId, publicApiEndpoint]);

	useEffect(() => {
		controllers.current.transactionApi?.abort();
		controllers.current.transactionApi = new AbortController();
		void validateTransactionApi(controllers.current.transactionApi);
	}, [networkId, transactionApiEndpoint]);

	useEffect(() => {
		controllers.current.evmApi?.abort();
		controllers.current.evmApi = new AbortController();
		void validateEvmApi(controllers.current.evmApi);
	}, [networkId, evmApiEndpoint]);

	return { fetchingDetails, networkMismatch, isInvalidEvmApi, serverHeight, isInvalidTransactionApi};
};

export { useHandleServers };
