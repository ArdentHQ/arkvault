import { useEffect, useRef, useState } from "react";
import { Http, Networks } from "@/app/lib/mainsail";
import { addressIsValid as checkIfAddressIsValid, getServerHeight } from "@/utils/peers";
import { FieldError, FieldErrors } from "react-hook-form";
import { CustomNetwork } from "@/domains/setting/pages/Servers/Servers.contracts";
import { useTranslation } from "react-i18next";

export async function pingTransactionApi(endpoint: string, controller?: AbortController): Promise<boolean> {
	const client = new Http.HttpClient(0).withOptions({ signal: controller?.signal });

	const response = await client.get(`${endpoint}/configuration`);

	const body = JSON.parse(response.body());

	return !!body.data.blockNumber;
}

export async function pingEvmApi(endpoint: string, controller?: AbortController): Promise<boolean> {
	const client = new Http.HttpClient(0).withOptions({ signal: controller?.signal });

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

type Endpoint = "publicApi" | "transactionApi" | "evmApi";

const useHandleServers = ({
	transactionApiEndpoint,
	publicApiEndpoint,
	evmApiEndpoint,
	network,
	errors,
	setError,
	clearErrors,
}: {
	publicApiEndpoint: string;
	transactionApiEndpoint: string;
	evmApiEndpoint: string;
	network?: Networks.Network;
	errors: FieldErrors<CustomNetwork>;
	setError: (name: keyof CustomNetwork, error: FieldError) => void;
	clearErrors: (name: keyof CustomNetwork | (keyof CustomNetwork)[] | undefined) => void;
}) => {
	const { t } = useTranslation();

	// Tracked per endpoint so one finished check cannot mark the form as ready while another is still running.
	const [fetching, setFetching] = useState<Record<Endpoint, boolean>>({
		evmApi: false,
		publicApi: false,
		transactionApi: false,
	});

	const setFetchingDetails = (endpoint: Endpoint, isFetching: boolean) =>
		setFetching((current) => ({ ...current, [endpoint]: isFetching }));

	const [serverHeight, setServerHeight] = useState<number | undefined>(undefined);

	function isValid(url: string, type: string) {
		if (!url || !network || errors[type] !== undefined) {
			return false;
		}

		return checkIfAddressIsValid(url);
	}

	async function validatePublicApi() {
		setServerHeight(undefined);

		if (!isValid(publicApiEndpoint, "publicApiEndpoint")) {
			return;
		}

		clearErrors("publicApiEndpoint");

		setFetchingDetails("publicApi", true);

		if (await network?.evaluateUrl(publicApiEndpoint)) {
			setServerHeight(await getServerHeight(publicApiEndpoint));
		} else {
			setError("publicApiEndpoint", {
				message: t("SETTINGS.SERVERS.ADD_NEW_SERVER.NETWORK_MISMATCH_ERROR"),
				type: "invalidUrl",
			});
		}
		setFetchingDetails("publicApi", false);
	}

	async function validateTransactionApi(controller: AbortController) {
		if (!isValid(transactionApiEndpoint, "transactionApiEndpoint")) {
			return;
		}

		clearErrors("transactionApiEndpoint");

		setFetchingDetails("transactionApi", true);

		try {
			const status = await pingTransactionApi(transactionApiEndpoint, controller);
			if (!status) {
				setError("transactionApiEndpoint", {
					message: t("SETTINGS.SERVERS.ADD_NEW_SERVER.ENDPOINT_ERROR"),
					type: "invalidUrl",
				});
			}
		} catch {
			setError("transactionApiEndpoint", {
				message: t("SETTINGS.SERVERS.ADD_NEW_SERVER.ENDPOINT_ERROR"),
				type: "invalidUrl",
			});
		}

		setFetchingDetails("transactionApi", false);
	}

	async function validateEvmApi(controller: AbortController) {
		if (!isValid(evmApiEndpoint, "evmApiEndpoint")) {
			return;
		}

		clearErrors("evmApiEndpoint");

		setFetchingDetails("evmApi", true);

		try {
			const status = await pingEvmApi(evmApiEndpoint, controller);
			if (!status) {
				setError("evmApiEndpoint", {
					message: t("SETTINGS.SERVERS.ADD_NEW_SERVER.ENDPOINT_ERROR"),
					type: "invalidUrl",
				});
			}
		} catch {
			setError("evmApiEndpoint", {
				message: t("SETTINGS.SERVERS.ADD_NEW_SERVER.ENDPOINT_ERROR"),
				type: "invalidUrl",
			});
		}

		setFetchingDetails("evmApi", false);
	}

	const controllers = useRef<Record<"transactionApi" | "evmApi", AbortController | undefined>>({
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

	const fetchingDetails = Object.values(fetching).some(Boolean);

	return { fetchingDetails, serverHeight };
};

export { useHandleServers };
