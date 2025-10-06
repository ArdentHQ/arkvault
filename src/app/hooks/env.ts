import { Contracts } from "@/app/lib/profiles";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";

import { useEnvironmentContext } from "@/app/contexts/Environment";
import { getUrlParameter } from "@/utils/paths";

export const useActiveProfile = (): Contracts.IProfile => {
	const location = useLocation();

	const context = useEnvironmentContext();
	// profiles/:profileId
	const profileId = getUrlParameter(location.pathname, 1);

	return useMemo(() => {
		if (!profileId || !context.env.profiles().has(profileId)) {
			throw new Error(`No profile found for [${profileId}]`);
		}

		return context.env.profiles().findById(profileId);
	}, [context.env, location.pathname, profileId]);
};

export const useHasProfile = (): boolean => {
	const location = useLocation();

	const context = useEnvironmentContext();

	return useMemo(() => {
		const isProfileRoute =
			location.pathname.startsWith("/profiles/") &&
			!["/profiles/create", "/profiles/import"].some((path) => location.pathname.startsWith(path));

		if (!isProfileRoute) {
			return false;
		}

		const profileId = getUrlParameter(location.pathname, 1);

		return profileId !== undefined && context.env.profiles().has(profileId);
	}, [location.pathname]);
};

export const useActiveWallet = (): Contracts.IReadWriteWallet => {
	const location = useLocation();
	const profile = useActiveProfile();
	// profiles/:profileId/wallets/:walletId
	const walletId = getUrlParameter(location.pathname, 3);

	return useMemo(() => profile.wallets().findById(walletId), [profile, walletId]);
};

export const useActiveWalletWhenNeeded = (isRequired: boolean) => {
	const location = useLocation();
	const profile = useActiveProfile();

	return useMemo(() => {
		try {
			// profiles/:profileId/wallets/:walletId
			const walletId = getUrlParameter(location.pathname, 3);
			return profile.wallets().findById(walletId);
		} catch (error) {
			if (isRequired) {
				throw error;
			}

			return;
		}
	}, [isRequired, profile, location]);
};
