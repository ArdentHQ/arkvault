import { useCallback, useState } from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { NormalizedNetwork, ServerStatus } from "@/domains/setting/pages/Servers/Servers.contracts";
import { pingServerAddress, getServerHeight } from "@/utils/peers";
import { useHosts } from "@/domains/setting/pages/Servers/hooks/use-hosts";

export const useServerStatus = ({ profile, network }: { profile: Contracts.IProfile; network: NormalizedNetwork }) => {
	const [serverStatus, setServerStatus] = useState(ServerStatus.Loading);
	const { updateNetwork } = useHosts({ profile });

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
	}, [profile, network]);

	return {
		serverStatus,
		syncStatus,
	};
};
