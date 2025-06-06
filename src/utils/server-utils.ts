import { Contracts } from "@/app/lib/profiles";
import { Networks } from "@/app/lib/mainsail";
import { NormalizedNetwork } from "@/domains/setting/pages/Servers/Servers.contracts";
import { groupCustomHosts } from "@/app/lib/mainsail/helpers/hosts";
import { Host } from "@/app/lib/profiles/host.repository.contract";

export const sortByName = (networks: NormalizedNetwork[]) => networks.sort((a, b) => a.name.localeCompare(b.name));

export interface CustomNetwork {
	enabled: boolean;
	evmApiEndpoint: string;
	height?: number;
	name: string;
	network: Networks.Network;
	publicApiEndpoint: string;
	transactionApiEndpoint: string;
}

export const customNetworks = (profile: Contracts.IProfile): CustomNetwork[] => {
	const networks = profile.hosts().all();

	const serverList: CustomNetwork[] = [];

	Object.keys(networks).flatMap((coin) => {
		const networkServers = networks[coin];

		for (const key in networkServers) {
			const groupedServers = groupCustomHosts(networkServers[key]);

			for (const name in groupedServers) {
				const servers = groupedServers[name];

				const publicHost = servers.find(({ host }) => host.type === "full")?.host as Host;
				const txHost = servers.find(({ host }) => host.type === "tx")?.host as Host;
				const evmHost = servers.find(({ host }) => host.type === "evm")?.host as Host;

				const network = profile.availableNetworks().find((network) => network.id() === `${coin}.${key}`);

				serverList.push({
					enabled: !!publicHost.enabled,
					evmApiEndpoint: evmHost.host,
					height: publicHost.height,
					name,
					network: network!,
					publicApiEndpoint: publicHost.host,
					transactionApiEndpoint: txHost.host,
				});
			}
		}
	});

	return serverList;
};

export const hasAvailableMusigServer = ({ profile }: { profile?: Contracts.IProfile; network: Networks.Network }) => {
	if (!profile) {
		return false;
	}

	// TODO: Check if the correct network id is provided in profile.hosts(), considering dynamic network ids.
	return false;
};
