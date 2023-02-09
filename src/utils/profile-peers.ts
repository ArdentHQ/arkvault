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

const groupPeersByNetwork = (peers: IPeer[]) => groupBy(peers, (peer) => peer.network().id()) as Record<string, IPeer[]>;

const customPeers = (env: Environment, profile: Contracts.IProfile) =>
	customNetworks(env, profile)
		.filter((network) => network.enabled)
		.map(Peer);

const defaultPeers = (env: Environment, profile: Contracts.IProfile) =>
	profileAllEnabledNetworks(profile)
		.map((network) => ({
			address: network.toObject().hosts.find((host) => host.type === "full")?.host || "",
			network,
			serverType: "full" as NetworkHostType,
		}))
		.map(Peer);

export const ProfilePeers = (env: Environment, profile: Contracts.IProfile) => {
	const allPeers = () => [...customPeers(env, profile), ...defaultPeers(env, profile)];

	const isHealthy = (peers: IPeer[]) => peers.every((peer) => peer.isUp());
	const isDowngraded = (peers: IPeer[]) => !isHealthy(peers) && peers.some((peer) => peer.isUp());
	const isUnavailable = (peers: IPeer[]) => peers.every((peer) => !peer.isUp());

	const healthStatusByNetwork = async (): Promise<Record<string, ServerHealthStatus>> => {
		const peers = allPeers();

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
