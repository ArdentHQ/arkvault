import { useEffect, useMemo } from "react";
import { useConfiguration, useEnvironmentContext } from "@/app/contexts";

import { Contracts } from "@/app/lib/profiles";
import { ProfilePeers } from "@/utils/profile-peers";
import { Services } from "@/app/lib/mainsail";
import { useSynchronizer } from "./use-synchronizer";

enum Intervals {
	VeryShort = 15_000,
	Short = 30_000,
	Medium = 60_000,
	Long = 120_000,
	VeryLong = 7_200_000,
}

export const useProfileJobs = (profile?: Contracts.IProfile): Record<string, any> => {
	const { env } = useEnvironmentContext();
	const { setConfiguration } = useConfiguration();
	const walletsCount = profile?.wallets().count();
	const profileId = profile?.id();

	return useMemo(() => {
		if (!profile || !profileId) {
			return {
				allJobs: [],
				syncExchangeRates: undefined,
				syncProfileWallets: undefined,
				syncServerStatus: undefined,
			};
		}

		const syncProfileWallets = {
			callback: async (reset = false) => {
				try {
					setConfiguration(profileId, {
						profileIsSyncingWallets: true,
						...(reset && { isProfileInitialSync: true }),
					});
					const activeNetwork = profile.activeNetwork();

					await profile.sync({ networkId: activeNetwork.id(), ttl: 15_000 });
					await env.wallets().syncByProfile(profile, activeNetwork ? [activeNetwork.id()] : undefined);

					const walletIdentifiers: Services.WalletIdentifier[] = profile
						.wallets()
						.values()
						.filter((wallet) =>
							profile.availableNetworks().some((network) => wallet.networkId() === network.id()),
						)
						.map((wallet) => ({
							networkId: wallet.networkId(),
							type: "address",
							value: wallet.address(),
						}));
					await profile.notifications().transactions().sync({ identifiers: walletIdentifiers });
				} finally {
					setConfiguration(profileId, { profileIsSyncingWallets: false });
				}
			},
			interval: Intervals.VeryShort,
		};

		const syncValidators = {
			callback: () => profile.validators().syncAll(profile),
			interval: Intervals.Long,
		};

		const syncExchangeRates = {
			callback: async () => {
				setConfiguration(profileId, { profileIsSyncingExchangeRates: true });
				const currencies = profile.availableNetworks().map((network) => network.ticker());
				const allRates = await Promise.all(
					currencies.map((currency) => profile.exchangeRates().syncAll(profile, currency)),
				);
				setConfiguration(profileId, { profileIsSyncingExchangeRates: false });
				return allRates;
			},
			interval: Intervals.Long,
		};

		const syncNotifications = {
			callback: () => profile.notifications().transactions().sync(),
			interval: Intervals.Long,
		};

		const syncKnownWallets = {
			callback: () => profile.knownWallets().sync(profile, profile.activeNetwork()),
			interval: Intervals.Long,
		};

		const syncServerStatus = {
			callback: async () => {
				setConfiguration(profileId, { serverStatus: await ProfilePeers(env, profile).healthStatusByNetwork() });
			},
			interval: Intervals.Long,
		};

		return {
			allJobs: [
				syncExchangeRates,
				syncNotifications,
				syncKnownWallets,
				syncValidators,
				syncProfileWallets,
				syncServerStatus,
			],
			syncExchangeRates: syncExchangeRates.callback,
			syncProfileWallets: syncProfileWallets.callback,
			syncServerStatus: syncServerStatus.callback,
		};
	}, [env, profile, walletsCount, setConfiguration, profileId]);
};

export const useProfileBackgroundJobsRunner = (profile?: Contracts.IProfile) => {
	const { allJobs } = useProfileJobs(profile);
	const { start, stop, runAll } = useSynchronizer(allJobs);

	useEffect(() => {
		if (profile) {
			runAll();
			start();
			return
		}

		stop({ clearTimers: true });

		return () => {
			stop({ clearTimers: true });
		}

	}, [profile])

};
