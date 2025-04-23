import { Contracts } from "@/app/lib/profiles";
import { NormalizedNetwork } from "@/domains/setting/pages/Servers/Servers.contracts";

const findNetworkIndex = (profile: Contracts.IProfile, normalizedNetwork: NormalizedNetwork) => {
	const { network, name, publicApiEndpoint, evmApiEndpoint, transactionApiEndpoint } = normalizedNetwork;
	const networkId = network.id();
	const parts = networkId.split(".");
	const hosts = profile.hosts().all()[parts[0]][parts[1]] || [];

	const index = hosts.findIndex(
		(item) =>
			item.name === name &&
			item.publicHost.host === publicApiEndpoint &&
			item.evmHost.host === evmApiEndpoint &&
			item.transactionHost.host === transactionApiEndpoint,
	);

	return [networkId, index];
};

const addNetwork = (
	profile: Contracts.IProfile,
	{ network, name, publicApiEndpoint, transactionApiEndpoint, evmApiEndpoint, enabled, height }: NormalizedNetwork,
) => {
	profile.hosts().push({
		// @ts-ignore
		enabled,
		evmHost: {
			host: evmApiEndpoint,
			type: "evm",
		},
		name: name,
		network: network.id(),
		publicHost: {
			height,
			host: publicApiEndpoint,
			type: "full",
		},
		transactionHost: {
			host: transactionApiEndpoint,
			type: "tx",
		},
		type: "full",
	});
};

const removeNetwork = (profile: Contracts.IProfile, network: NormalizedNetwork) => {
	const [networkId, index] = findNetworkIndex(profile, network);
	profile.hosts().forget(networkId, index);
};

export const useHosts = ({ profile }: { profile: Contracts.IProfile }) => ({
	updateNetwork: (network: NormalizedNetwork, newNetwork: NormalizedNetwork) => {
		removeNetwork(profile, network);
		addNetwork(profile, newNetwork);
	},
	updateNetworks: (networks: NormalizedNetwork[]) => {
		for (const networkName of Object.keys(profile.hosts().all())) {
			profile.hosts().fill({ [networkName]: {} });
		}

		for (const network of networks) {
			addNetwork(profile, network);
		}
	},
});
