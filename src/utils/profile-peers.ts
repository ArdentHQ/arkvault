import { Contracts, Environment } from "@ardenthq/sdk-profiles";
import { Networks } from "@ardenthq/sdk";
import { groupBy } from "@ardenthq/sdk-helpers";
import { profileAllEnabledNetworks } from "./network-utils";
import { pingServerAddress } from "@/utils/peers";
import { NetworkHostType } from "@/domains/setting/pages/Servers/Servers.contracts";
import { customNetworks } from "@/utils/server-utils";

export interface ServerStatus {
	[network: string]: {
		[host: string]: boolean;
	};
}

interface PeerData {
	address: string;
	serverType: NetworkHostType;
	network: Networks.Network;
}

interface IPeer {
	network: () => Networks.Network;
	address: () => string;
	sync: () => Promise<void>;
	isUp: () => boolean;
}

const Peer = (peer: PeerData): IPeer => {
	let isUp = false;

	return {
		address: () => peer.address,
		isUp: () => isUp,
		network: () => peer.network,
		sync: async () => {
			isUp = await pingServerAddress(peer.address, peer.serverType);
		},
	};
};

const groupPeersByNetwork = (peers: IPeer[]) =>
	groupBy(peers, (peer) => peer.network().id()) as Record<string, IPeer[]>;

const customPeers = (env: Environment, profile: Contracts.IProfile) =>
	customNetworks(env, profile)
		.filter((network) => network.enabled)
		.map(Peer);

const defaultPeers = (env: Environment, profile: Contracts.IProfile) => {
	const peers: IPeer[] = [];

	for (const network of profileAllEnabledNetworks(profile)) {
		for (const host of network.toObject().hosts) {
			if (host.type === "full") {
				peers.push(
					Peer({
						address: host.host ?? "",
						network,
						serverType: host.type as NetworkHostType,
					}),
				);
			}
		}
	}

	return peers;
};

export const ProfilePeers = (env: Environment, profile: Contracts.IProfile) => {
	const healthStatusByNetwork = async (): Promise<ServerStatus> => {
		const peers: IPeer[] = [...customPeers(env, profile), ...defaultPeers(env, profile)];

		await Promise.all(peers.map((peer) => peer.sync()));

		const peerMap = groupPeersByNetwork(peers);

		const status: ServerStatus = {};

		for (const [networkId, peers] of Object.entries(peerMap)) {
			status[networkId] = {};

			for (const peer of peers) {
				status[networkId][peer.address()] = peer.isUp();
			}
		}

		return status;
	};

	return {
		healthStatusByNetwork,
	};
};
