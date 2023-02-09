import { useCallback, useState } from "react";
import { Contracts, Environment } from "@ardenthq/sdk-profiles";
import { NormalizedNetwork, ServerHealthStatus, ServerStatus } from "@/domains/setting/pages/Servers/Servers.contracts";
import { pingServerAddress, getServerHeight } from "@/utils/peers";
import { useHosts } from "@/domains/setting/pages/Servers/hooks/use-hosts";
import { useConfiguration } from "@/app/contexts";
import { ProfilePeers } from "@/utils/profile-peers";

export const useServerStatus = ({ env, profile, network }: { env: Environment; profile: Contracts.IProfile; network: NormalizedNetwork }) => {
	const [serverStatus, setServerStatus] = useState(ServerStatus.Loading);
	const { updateNetwork } = useHosts({ profile });

	const { serverStatus: serverStatusByNetwork, setConfiguration } = useConfiguration();

	const syncStatus = useCallback(async () => {
		setServerStatus(ServerStatus.Loading);

		const status = (await pingServerAddress(network.address, network.serverType))
			? ServerStatus.Online
			: ServerStatus.Offline;

		setServerStatus(status);

		if (status === ServerStatus.Online && network.serverType === "full") {
			updateNetwork(network, {
				...network,
				height: await getServerHeight(network.address),
			});
		}

		const updatedServerStatus = await ProfilePeers(env, profile).healthStatusByNetwork(network.network.id());

		setConfiguration({
			serverStatus: {
				...serverStatusByNetwork,
				...updatedServerStatus,
			},
		});
	}, [profile, network]);

	return {
		serverStatus,
		syncStatus,
	};
};
