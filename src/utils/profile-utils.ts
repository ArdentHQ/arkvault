import { matchPath } from "react-router-dom";
import { Contracts, Environment } from "@ardenthq/sdk-profiles";

import { profileAllEnabledNetworkIds } from "./network-utils";
import { isLedgerTransportSupported } from "@/app/contexts/Ledger/transport";

export const getProfileById = (env: Environment, id: string) => {
	if (!id) {
		return;
	}

	let response: Contracts.IProfile | undefined;

	try {
		response = env.profiles().findById(id);
	} catch {
		// Not a valid profile id. Ignore.
	}

	return response;
};

export const getProfileFromUrl = (env: Environment, url: string) => {
	const urlMatch = matchPath({ end: false, path: "/profiles/:profileId" }, url);
	const urlProfileId = (urlMatch?.params as any)?.profileId;
	return getProfileById(env, urlProfileId);
};

export const getProfileStoredPassword = (profile: Contracts.IProfile) => {
	if (!profile.usesPassword()) {
		return;
	}

	try {
		return profile.password().get();
	} catch {
		return;
	}
};

export const getErroredNetworks = (profile: Contracts.IProfile) => {
	const enabledNetworksIds = profileAllEnabledNetworkIds(profile);

	const wallets = profile
		.wallets()
		.values()
		.filter((wallet) => enabledNetworksIds.includes(wallet.networkId()));

	const erroredNetworks: string[] = [];

	for (const wallet of wallets) {
		const name = `${wallet.network().coin()} ${wallet.network().name()}`;

		if (erroredNetworks.includes(name)) {
			continue;
		}

		if (wallet.isCold()) {
			continue;
		}

		if (wallet.hasBeenFullyRestored() && wallet.hasSyncedWithNetwork()) {
			continue;
		}

		erroredNetworks.push(name);
	}

	return { erroredNetworks, hasErroredNetworks: erroredNetworks.length > 0 };
};

export const isValidProfileUrl = (env: Environment, url: string) => {
	if (url.startsWith("/profiles")) {
		const profile = getProfileFromUrl(env, url);

		// Corrupted profile url. Force redirect to welcome page.
		if (!profile) {
			return false;
		}
	}

	return true;
};

export const hasIncompatibleLedgerWallets = (profile: Contracts.IProfile) => {
	const hasLedgerWallets = profile
		.wallets()
		.values()
		.some((wallet) => wallet.isLedger());

	return hasLedgerWallets && !isLedgerTransportSupported();
};
