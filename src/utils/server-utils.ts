import { Contracts, Environment } from "@ardenthq/sdk-profiles";
import { Networks } from "@ardenthq/sdk";
import { NormalizedNetwork } from "@/domains/setting/pages/Servers/Servers.contracts";

export const sortByName = (networks: NormalizedNetwork[]) => networks.sort((a, b) => a.name.localeCompare(b.name));

export const customNetworks = (env: Environment, profile: Contracts.IProfile) => {
	const networks = profile.hosts().all();

	return Object.keys(networks).flatMap((coin) => {
		const networkServers = networks[coin];

		return Object.keys(networkServers).flatMap((server) => {
			const servers = networkServers[server];
			const network = env.availableNetworks().find((network) => network.id() === `${coin}.${server}`);

			return servers.map((server) => ({
				address: server.host.host,
				enabled: server.host.enabled,
				height: server.host.height,
				name: server.name,
				network: network,
				serverType: server.host.type,
			}));
		});
	});
};

export const hasAvailableMusigServer = ({ profile }: { profile?: Contracts.IProfile; network: Networks.Network }) => {
	if (!profile) {
		return false;
	}

	// TODO: Check if the correct network id is provided in profile.hosts(), considering dynamic network ids.
	return false;
};
