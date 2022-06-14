import { Contracts } from "@ardenthq/sdk-profiles";
import { NormalizedNetwork } from "@/domains/setting/pages/Servers/Servers.contracts";

const findNetworkIndex = (profile: Contracts.IProfile, normalizedNetwork: NormalizedNetwork) => {
	const { network, name, address, serverType } = normalizedNetwork;
	const networkId = network.id();
	const parts = networkId.split(".");
	const hosts = profile.hosts().all()[parts[0]][parts[1]] || [];

	const index = hosts.findIndex(
		(item) => item.name === name && item.host.host === address && item.host.type === serverType,
	);

	return [networkId, index];
};

const addNetwork = (
	profile: Contracts.IProfile,
	{ network, name, serverType, address, enabled, height }: NormalizedNetwork,
) => {
	profile.hosts().push({
		host: {
			enabled: enabled,
			height: height,
			host: address,
			type: serverType,
		},
		name: name,
		network: network.id(),
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
