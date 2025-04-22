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

export async function pingTransactionApi(endpoint: string, controller: AbortController): Promise<boolean> {
	const { signal } = controller;
	const client = new HttpClient(0).withOptions({ signal });

	const response = await client.get(`${endpoint}/configuration`);

	const body = JSON.parse(response.body());

	return !!body.data.height;
}

export async function pingEvmApi(endpoint: string, controller: AbortController): Promise<boolean> {
	const { signal } = controller;
	const client = new HttpClient(0).withOptions({ signal });

	const response = await client.post(endpoint, {
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

	return body.result === "0x";
}

const useHandleServers = ({
	profile,
	transactionApiEndpoint,
	publicApiEndpoint,
	evmApiEndpoint,
	network,
	errors,
	setError,
	clearErrors,
}: {
	profile: Contracts.IProfile;
	publicApiEndpoint: string;
	transactionApiEndpoint: string;
	evmApiEndpoint: string;
	network?: Networks.Network;
	errors: DeepMap<CustomNetwork, FieldError>;
	setError: (name: keyof CustomNetwork, error: FieldError) => void;
	clearErrors: (name: keyof CustomNetwork|(keyof CustomNetwork)[]|undefined) => void;
}) => {
	const [fetchingDetails, setFetchingDetails] = useState(false);

	const [serverHeight, setServerHeight] = useState<number | undefined>(undefined);

	function isValid(url: string, type: string) {
		if (!url || !network || errors[type] !== undefined) {
			return false;
		}

		return checkIfAddressIsValid(url);
	}

	async function validatePublicApi() {
		setServerHeight(undefined);

		clearErrors("publicApiEndpoint");

		if (!isValid(publicApiEndpoint, "publicApiEndpoint")) {
			return;
		}

		setFetchingDetails(true);

		if (await urlBelongsToNetwork(profile, publicApiEndpoint, network!)) {
			setServerHeight(await getServerHeight(publicApiEndpoint));
		} else {
			setError("publicApiEndpoint", { message: "Network mismatch", type: "invalidUrl"})
		}
		setFetchingDetails(false);
	}

	async function validateTransactionApi(controller: AbortController) {
		if (!isValid(transactionApiEndpoint, "transactionApiEndpoint")) {
			return;
		}

		setFetchingDetails(true);
		clearErrors("transactionApiEndpoint");

		try {
			const status = await pingTransactionApi(transactionApiEndpoint, controller);
			if(!status) {
				setError(
					"transactionApiEndpoint",
					{ message: "Transaction API Endpoint is not valid", type: "invalidUrl" },
				);
			}
		} catch {
			setError("transactionApiEndpoint", { message: "Invalid URL", type: "invalidUrl" });
		}

		setFetchingDetails(false);
	}

	async function validateEvmApi(controller: AbortController) {
		if (!isValid(evmApiEndpoint, "evmApiEndpoint")) {
			return;
		}

		setFetchingDetails(true);
		clearErrors("evmApiEndpoint");

		try {
			const status = await pingEvmApi(evmApiEndpoint, controller);
			if(!status) {
				setError(
					"evmApiEndpoint",
					{ message: "EVM API Endpoint is not valid", type: "invalidUrl" },
				);
			}
		} catch {
			setError("evmApiEndpoint", { message: "Invalid URL", type: "invalidUrl" });
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

	return { fetchingDetails, serverHeight };
};

export { useHandleServers };
