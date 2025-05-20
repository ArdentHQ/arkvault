import { useCallback, useState } from "react";
import { Contracts } from "@/app/lib/profiles";
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

	const updateConfiguration = (endpoint: string, isOnline: boolean) => {
		const updatedServerStatus = { ...serverStatusByNetwork };

		/* istanbul ignore next -- @preserve */
		if (updatedServerStatus[network.network.id()] === undefined) {
			updatedServerStatus[network.network.id()] = {};
		}

		updatedServerStatus[network.network.id()][endpoint] = isOnline;

		setConfiguration(profile.id(), {
			serverStatus: updatedServerStatus,
		});
	};

	const syncPublicApiStatus = useCallback(async () => {
		setPublicApiStatus(undefined);

		let isOnline: boolean;
		try {
			isOnline = await pingServerAddress(network.publicApiEndpoint, "full");
		} catch {
			isOnline = false;
		}

		setPublicApiStatus(isOnline);

		if (isOnline) {
			updateNetwork(network, {
				...network,
				height: await getServerHeight(network.publicApiEndpoint),
			});
		}

		updateConfiguration(network.publicApiEndpoint, isOnline);
	}, [profile, network]);

	const syncTxApiStatus = useCallback(async () => {
		setTxApiStatus(undefined);

		let isOnline: boolean;
		try {
			isOnline = await pingTransactionApi(network.transactionApiEndpoint, new AbortController());
		} catch {
			isOnline = false;
		}

		setTxApiStatus(isOnline);
		updateConfiguration(network.transactionApiEndpoint, isOnline);
	}, [profile, network]);

	const syncEvmApiStatus = useCallback(async () => {
		setEvmApiStatus(undefined);

		let isOnline: boolean;
		try {
			isOnline = await pingEvmApi(network.evmApiEndpoint, new AbortController());
		} catch {
			isOnline = false;
		}

		setEvmApiStatus(isOnline);

		updateConfiguration(network.evmApiEndpoint, isOnline);
	}, [profile, network]);

	return {
		evmApiStatus,
		publicApiStatus,
		syncStatus: () => {
			void syncPublicApiStatus();
			void syncTxApiStatus();
			void syncEvmApiStatus();
		},
		txApiStatus,
	};
};
