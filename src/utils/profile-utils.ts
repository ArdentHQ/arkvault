import { matchPath } from "react-router-dom";
import { Contracts, Environment } from "@ardenthq/sdk-profiles";

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
	const urlMatch = matchPath(url, { path: "/profiles/:profileId" });
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
	const erroredNetworks: string[] = [];

	for (const wallet of profile.wallets().values()) {
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
