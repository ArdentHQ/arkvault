import { Contracts } from "@/app/lib/profiles";
import { Networks } from "@/app/lib/mainsail";
import { uniq } from "@/app/lib/helpers";

export const isCustomNetwork = (network?: Networks.NetworkManifest | Networks.Network): boolean => {
	if (typeof network?.id === "function") {
		return network.id().endsWith(".custom");
	}

	return !!network?.id.endsWith(".custom");
};

export const networkDisplayName = (network: Networks.Network | undefined | null) => {
	if (!network) {
		return "";
	}

	if (isCustomNetwork(network)) {
		return network.coinName();
	}

	return network.displayName();
};

export const profileAllEnabledNetworks = (profile: Contracts.IProfile) =>
	profile.availableNetworks().filter((network) => {
		if (isCustomNetwork(network)) {
			return network.meta().enabled;
		}

		return true;
	});

export const profileAllEnabledNetworkIds = (profile: Contracts.IProfile) =>
	profileAllEnabledNetworks(profile)
		.filter((network) => !!network)
		.map((network) => network.id());

export const profileEnabledNetworkIds = (profile: Contracts.IProfile) =>
	uniq(
		profile
			.wallets()
			.values()
			.filter((wallet) => profileAllEnabledNetworkIds(profile).includes(wallet.network().id()))
			.map((wallet) => wallet.network().id()),
	);

export const networksAsOptions = (networks?: Networks.Network[]) => {
	if (!networks) {
		return [];
	}

	return networks.map((network) => {
		let label = network.coinName();

		if (network.isTest() && !isCustomNetwork(network)) {
			label = `${label} ${network.name()}`;
		}

		return {
			isTestNetwork: network.isTest(),
			label,
			value: network.id(),
		};
	});
};

export const findNetworkFromSearchParameters = (profile: Contracts.IProfile, searchParameters: URLSearchParams) => {
	const nethash = searchParameters.get("nethash");
	const networkId = searchParameters.get("network");

	if (nethash) {
		return profileAllEnabledNetworks(profile).find((network) => network.meta().nethash === nethash);
	}

	if (networkId) {
		return profileAllEnabledNetworks(profile).find((network) => network.id() === networkId);
	}
};

export const hasNetworksWithLedgerSupport = (profile: Contracts.IProfile) => {
	const enabledNetworks = profileAllEnabledNetworks(profile);
	return enabledNetworks.some((network) => network.allows("Ledger"));
};
