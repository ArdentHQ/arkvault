import { Contracts } from "@ardenthq/sdk-profiles";
import { useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";

import { useEnvironmentContext } from "@/app/contexts/Environment";

export const useActiveProfile = (): Contracts.IProfile => {
	const location = useLocation();

	const context = useEnvironmentContext();
	const { profileId } = useParams<{ profileId: string }>();

	return useMemo(() => {
		if (!profileId) {
			throw new Error(
				`Parameter [profileId] must be available on the route where [useActiveProfile] is called. Current route is [${location.pathname}].`,
			);
		}

		return context.env.profiles().findById(profileId);
	}, [context.env, location.pathname, profileId]);
};

export const useActiveWallet = (): Contracts.IReadWriteWallet => {
	const profile = useActiveProfile();
	const { walletId } = useParams<{ walletId: string }>();

	return useMemo(() => profile.wallets().findById(walletId as string), [profile, walletId]);
};

export const useActiveWalletWhenNeeded = (isRequired: boolean) => {
	const profile = useActiveProfile();
	const { walletId } = useParams<{ walletId: string }>();

	return useMemo(() => {
		try {
			return profile.wallets().findById(walletId as string);
		} catch (error) {
			if (isRequired) {
				throw error;
			}

			return;
		}
	}, [isRequired, profile, walletId]);
};
