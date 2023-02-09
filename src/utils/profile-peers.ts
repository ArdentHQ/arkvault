import { Contracts, Environment } from "@ardenthq/sdk-profiles";
import { Networks } from "@ardenthq/sdk";
import { groupBy } from "@ardenthq/sdk-helpers";
import { profileAllEnabledNetworks } from "./network-utils";
import { pingServerAddress } from "@/utils/peers";
import { ServerHealthStatus, NetworkHostType } from "@/domains/setting/pages/Servers/Servers.contracts";
import { customNetworks } from "@/utils/server-utils";

interface PeerData {
	address: string;
	serverType: NetworkHostType;
	network: Networks.Network;
}

interface IPeer {
	network: () => Networks.Network;
	sync: () => Promise<void>;
	isUp: () => boolean;
}

const Peer = (peer: PeerData): IPeer => {
	let isUp = false;

	return {
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
			if (host.type === "full" || host.type === "musig") {
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

const isHealthy = (peers: IPeer[]) => peers.every((peer) => peer.isUp());
const isDowngraded = (peers: IPeer[]) => !isHealthy(peers) && peers.some((peer) => peer.isUp());
const isUnavailable = (peers: IPeer[]) => peers.every((peer) => !peer.isUp());

export const ProfilePeers = (env: Environment, profile: Contracts.IProfile) => {
	const getPeers = (type?: "custom" | "default") => {
		if (type === "custom") {
			return [...customPeers(env, profile)];
		}

		if (type === "default") {
			return [...defaultPeers(env, profile)];
		}

		return [...customPeers(env, profile), ...defaultPeers(env, profile)];
	};

	const healthStatusByNetwork = async (
		networkId?: string,
		type?: "custom" | "default",
	): Promise<Record<string, ServerHealthStatus>> => {
		let peers: IPeer[] = getPeers(type);

		if (networkId) {
			peers = peers.filter((peer) => peer.network().id() === networkId);
		}

		await Promise.all(peers.map((peer) => peer.sync()));

		const networks = groupPeersByNetwork(peers);

		const statuses: Record<string, ServerHealthStatus> = {};

		for (const [networkId, peers] of Object.entries(networks)) {
			let status;

			if (isHealthy(peers)) {
				status = ServerHealthStatus.Healthy;
			}

			if (isDowngraded(peers)) {
				status = ServerHealthStatus.Downgraded;
			}

			if (isUnavailable(peers)) {
				status = ServerHealthStatus.Unavailable;
			}

			statuses[networkId] = status;
		}

		return statuses;
	};

	return {
		healthStatusByNetwork,
	};
};
