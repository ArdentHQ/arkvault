import { useCallback, useState } from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { NormalizedNetwork } from "@/domains/setting/pages/Servers/Servers.contracts";
import { pingServerAddress, getServerHeight } from "@/utils/peers";
import { useHosts } from "@/domains/setting/pages/Servers/hooks/use-hosts";
import { useConfiguration } from "@/app/contexts";

export const useServerStatus = ({ profile, network }: { profile: Contracts.IProfile; network: NormalizedNetwork }) => {
	const [serverStatus, setServerStatus] = useState<boolean | undefined>(undefined);
	const { updateNetwork } = useHosts({ profile });

	const { serverStatus: serverStatusByNetwork, setConfiguration } = useConfiguration();

	const syncStatus = useCallback(async () => {
		setServerStatus(undefined);

		const isOnline = await pingServerAddress(network.address, network.serverType);

		setServerStatus(isOnline);

		if (isOnline && network.serverType === "full") {
			updateNetwork(network, {
				...network,
				height: await getServerHeight(network.address),
			});
		}

		const updatedServerStatus = { ...serverStatusByNetwork };

		/* istanbul ignore next -- @preserve */
		if (updatedServerStatus[network.network.id()] === undefined) {
			updatedServerStatus[network.network.id()] = {};
		}

		updatedServerStatus[network.network.id()][network.address] = isOnline;

		setConfiguration({
			serverStatus: updatedServerStatus,
		});
	}, [profile, network]);

	return {
		serverStatus,
		syncStatus,
	};
};
