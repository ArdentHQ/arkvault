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

interface INetworkPeers {
	sync: () => Promise<void[]>;
	isUnavailable: () => boolean;
	isDowngraded: () => boolean;
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

const groupByNetwork = (peers: IPeer[]) => Object.values(groupBy(peers, (peer) => peer.network().id()));

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

const NetworkPeers = (peers: IPeer[]): INetworkPeers => {
	const isHealthy = () => peers.every((peer) => peer.isUp());

	return {
		isDowngraded: () => !isHealthy() && peers.some((peer) => peer.isUp()),
		isUnavailable: () => peers.every((peer) => !peer.isUp()),
		sync: () => Promise.all(peers.map((peer) => peer.sync())),
	};
};

const NetworkPeerStatuses = (networks: INetworkPeers[]) => ({
	isAnyDowngraded: () => networks.some((network) => network.isDowngraded()),
	isAnyUnavailable: () => networks.some((network) => network.isUnavailable()),
	sync: () => Promise.all(networks.map((network) => network.sync())),
});

export const ProfilePeers = (env: Environment, profile: Contracts.IProfile) => {
	const allPeers = () => [...customPeers(env, profile), ...defaultPeers(env, profile)];

	const healthStatus = async (): Promise<ServerHealthStatus> => {
		const networks = NetworkPeerStatuses(groupByNetwork(allPeers()).map(NetworkPeers));
		await networks.sync();

		if (networks.isAnyUnavailable()) {
			return ServerHealthStatus.Unavailable;
		}

		if (networks.isAnyDowngraded()) {
			return ServerHealthStatus.Downgraded;
		}

		return ServerHealthStatus.Healthy;
	};

	return {
		healthStatus,
	};
};
