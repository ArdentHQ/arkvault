import { Contracts } from "@/app/lib/profiles";
import { NormalizedNetwork } from "@/domains/setting/pages/Servers/Servers.contracts";
import { NetworkHostType } from "@/app/lib/sdk/network.models";

const findNetworkIndex = (profile: Contracts.IProfile, normalizedNetwork: NormalizedNetwork, type: NetworkHostType) => {
	const { network, name, publicApiEndpoint, evmApiEndpoint, transactionApiEndpoint } = normalizedNetwork;
	const networkId = network.id();
	const parts = networkId.split(".");
	const hosts = profile.hosts().all()[parts[0]][parts[1]] ?? [];

	const host = {
		evm: evmApiEndpoint,
		full: publicApiEndpoint,
		tx: transactionApiEndpoint,
	}[type];

	const index = hosts.findIndex((item) => item.name === name && item.host.host === host);

	return [networkId, index] as [string, number];
};

const addNetwork = (
	profile: Contracts.IProfile,
	{ network, name, publicApiEndpoint, transactionApiEndpoint, evmApiEndpoint, enabled, height }: NormalizedNetwork,
) => {
	profile.hosts().push({
		host: {
			enabled: enabled,
			height: height,
			host: publicApiEndpoint,
			type: "full",
		},
		name: name,
		network: network.id(),
	});

	profile.hosts().push({
		host: {
			enabled: enabled,
			host: transactionApiEndpoint,
			type: "tx",
		},
		name: name,
		network: network.id(),
	});

	profile.hosts().push({
		host: {
			enabled: enabled,
			height: height,
			host: evmApiEndpoint,
			type: "evm",
		},
		name: name,
		network: network.id(),
	});
};

const removeNetwork = (profile: Contracts.IProfile, network: NormalizedNetwork) => {
	const [networkId, publicHostIndex] = findNetworkIndex(profile, network, "full");
	profile.hosts().forget(networkId, publicHostIndex);

	const [_, txHostIndex] = findNetworkIndex(profile, network, "tx");
	profile.hosts().forget(networkId, txHostIndex);

	const [_n, evmHostIndex] = findNetworkIndex(profile, network, "evm");
	profile.hosts().forget(networkId, evmHostIndex);
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
