import { UUID } from "@ardenthq/sdk-cryptography";
import { ARK } from "@ardenthq/sdk-ark";
import { Contracts } from "@ardenthq/sdk-profiles";
import { Networks } from "@ardenthq/sdk";
import { uniq } from "@ardenthq/sdk-helpers";
import { NodeConfigurationResponse } from "@/domains/setting/pages/Networks/Networks.contracts";
import { UserCustomNetwork } from "@/domains/setting/pages/Servers/Servers.contracts";

export const networkName = (network: Networks.NetworkManifest) => `${network.name}`;

export const networkInitials = (network: Networks.NetworkManifest): string =>
	networkName(network).slice(0, 2).toUpperCase();

export const buildNetwork = (
	networkData: UserCustomNetwork,
	response: NodeConfigurationResponse,
): Networks.NetworkManifest => {
	const arkNetwork = ARK.manifest.networks["ark.mainnet"];

	const constants: Networks.NetworkManifestConstants = {
		...arkNetwork.constants,
	};

	constants.slip44 = Number(networkData.slip44);

	const currency = {
		decimals: arkNetwork.currency.decimals,
		symbol: response.symbol ?? arkNetwork.currency.symbol,
		ticker: networkData.ticker ?? arkNetwork.currency.ticker,
	};

	const { explorer, featureFlags, governance, importMethods, transactions } = arkNetwork;

	const hosts: Networks.NetworkHost[] = [
		{
			failedCount: 0,
			host: networkData.address,
			type: "full",
		},
	];

	if (networkData.explorer) {
		hosts.push({
			host: networkData.explorer,
			type: "explorer",
		});
	}

	const meta = {
		epoch: response.constants?.epoch,
		nethash: response.nethash,
		version: response.version,
	};

	return {
		coin: networkData.name,
		constants,
		currency,
		explorer,
		featureFlags,
		governance,
		hosts,
		id: `${UUID.random()}.custom`,
		importMethods,
		knownWallets: networkData.knownWallets,
		meta,
		name: networkData.name,
		transactions,
		type: networkData.type,
	};
};

export const isCustomNetwork = (network: Networks.NetworkManifest | Networks.Network): boolean => {
	if (typeof network.id === "function") {
		return network.id().endsWith(".custom");
	}

	return network.id.endsWith(".custom");
};

export const isValidKnownWalletUrlResponse = (response: PromiseSettledResult<any>): boolean => {
	if (response.status === "rejected") {
		return false;
	} else {
		try {
			const knownWallets = JSON.parse(response.value.body());

			return (
				Array.isArray(knownWallets) &&
				(knownWallets.length === 0 ||
					(typeof knownWallets === "object" &&
						knownWallets[0].name !== undefined &&
						knownWallets[0].address !== undefined &&
						knownWallets[0].type !== undefined))
			);
		} catch {
			return false;
		}
	}
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
	profileAllEnabledNetworks(profile).map((network) => network.id());

export const profileEnabledNetworkIds = (profile: Contracts.IProfile) =>
	uniq(
		profile
			.wallets()
			.values()
			.filter((wallet) => profileAllEnabledNetworkIds(profile).includes(wallet.network().id()))
			.map((wallet) => wallet.network().id()),
	);

export const enabledNetworksCount = (profile: Contracts.IProfile) => profileAllEnabledNetworkIds(profile).length;

export const networksAsOptions = (networks?: Networks.Network[]) => {
	if (!networks) {
		return [];
	}

	return networks.map((network) => {
		let label = network?.coinName();

		if (network?.isTest() && !isCustomNetwork(network)) {
			label = `${label} ${network.name()}`;
		}

		return {
			isTestNetwork: network?.isTest(),
			label,
			value: network?.id(),
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
	return enabledNetworks.length > 0 && enabledNetworks.some((network) => network.allows("Ledger"));
};