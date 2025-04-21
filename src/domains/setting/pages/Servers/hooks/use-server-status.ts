import { useCallback, useState } from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { NormalizedNetwork } from "@/domains/setting/pages/Servers/Servers.contracts";
import { pingServerAddress, getServerHeight } from "@/utils/peers";
import { useHosts } from "@/domains/setting/pages/Servers/hooks/use-hosts";
import { useConfiguration } from "@/app/contexts";
import { pingEvmApi, pingTransactionApi } from "@/domains/setting/hooks/use-handle-servers";

export const useServerStatus = ({ profile, network }: { profile: Contracts.IProfile; network: NormalizedNetwork }) => {
	const [publicApiStatus, setPublicApiStatus] = useState<boolean | undefined>(undefined);
	const [txApiStatus, setTxApiStatus] = useState<boolean | undefined>(undefined);
	const [evmApiStatus, setEvmApiStatus] = useState<boolean | undefined>(undefined);
	const { updateNetwork } = useHosts({ profile });

	const { setConfiguration, getProfileConfiguration } = useConfiguration();

	const { serverStatus: serverStatusByNetwork } = getProfileConfiguration(profile.id());

	const updateConfiguration = (key: string, endpoint: string, isOnline: boolean) => {
		const updatedServerStatus = { ...serverStatusByNetwork };

		/* istanbul ignore next -- @preserve */
		if (updatedServerStatus[network.network.id()] === undefined) {
			updatedServerStatus[network.network.id()] = {};
		}

		updatedServerStatus[network.network.id()][endpoint] = isOnline;

		setConfiguration(profile.id(), {
			[key]: updatedServerStatus,
		});
	}

	const syncPublicApiStatus = useCallback(async () => {
		setPublicApiStatus(undefined);

		const isOnline = await pingServerAddress(network.publicApiEndpoint, "full");

		setPublicApiStatus(isOnline);

		if (isOnline) {
			updateNetwork(network, {
				...network,
				height: await getServerHeight(network.publicApiEndpoint),
			});
		}

		updateConfiguration("publicApi", network.publicApiEndpoint, isOnline);
	}, [profile, network]);

	const syncTxApiStatus = useCallback(async () => {
		setTxApiStatus(undefined);

		const isOnline = await pingTransactionApi(network.transactionApiEndpoint, new AbortController());

		setTxApiStatus(isOnline);

		updateConfiguration("transactionApi", network.transactionApiEndpoint, isOnline);
	}, [profile, network]);

	const syncEvmApiStatus = useCallback(async () => {
		setEvmApiStatus(undefined);

		const isOnline = await pingEvmApi(network.evmApiEndpoint, new AbortController());

		setEvmApiStatus(isOnline);

		updateConfiguration("evmApi", network.evmApiEndpoint, isOnline);
	}, [profile, network]);

	return {
		publicApiStatus,
		txApiStatus,
		evmApiStatus,
		syncStatus: () => {
			void syncPublicApiStatus();
			void syncTxApiStatus();
			void syncEvmApiStatus();
		},
	};
};
