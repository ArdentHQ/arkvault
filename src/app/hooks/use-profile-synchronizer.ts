import { matchPath, useHistory, useLocation } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { Services } from "@ardenthq/sdk";
import { isEqual } from "@ardenthq/sdk-helpers";
import { usePrevious } from "./use-previous";
import { useSynchronizer } from "./use-synchronizer";
import { useTheme } from "./use-theme";
import { enabledNetworksCount, profileAllEnabledNetworks, profileEnabledNetworkIds } from "@/utils/network-utils";
import {
	getErroredNetworks,
	getProfileById,
	getProfileFromUrl,
	getProfileStoredPassword,
	hasIncompatibleLedgerWallets,
} from "@/utils/profile-utils";
import { useConfiguration, useEnvironmentContext } from "@/app/contexts";

import { DashboardConfiguration } from "@/domains/dashboard/pages/Dashboard";
import { ProfilePeers } from "@/utils/profile-peers";
import { delay } from "@/utils/delay";

import { useAccentColor } from "@/app/hooks/use-accent-color";
import { useAutoSignOut } from "@/app/hooks/use-auto-signout";
import { useZendesk } from "@/app/contexts/Zendesk";

enum Intervals {
	VeryShort = 15_000,
	Short = 30_000,
	Medium = 60_000,
	Long = 120_000,
	VeryLong = 7_200_000,
}

const useProfileWatcher = () => {
	const location = useLocation();

	const { env } = useEnvironmentContext();

	const pathname = (location as any).location?.pathname || location.pathname;
	const match = useMemo(() => matchPath(pathname, { path: "/profiles/:profileId" }), [pathname]);
	const profileId = (match?.params as any)?.profileId;
	const allProfilesCount = env.profiles().count();

	return useMemo(() => getProfileById(env, profileId), [profileId, env, allProfilesCount]); // eslint-disable-line react-hooks/exhaustive-deps
};

export const useProfileJobs = (profile?: Contracts.IProfile): Record<string, any> => {
	const { env } = useEnvironmentContext();
	const { setConfiguration } = useConfiguration();

	const walletsCount = profile?.wallets().count();

	return useMemo(() => {
		if (!profile) {
			return [];
		}

		const syncProfileWallets = {
			callback: async (reset = false) => {
				try {
					setConfiguration({
						profileIsSyncingWallets: true,
						...(reset && { isProfileInitialSync: true }),
					});

					await env.wallets().syncByProfile(profile);
					await profile.sync();

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

					// Update dashboard transactions
					await profile.notifications().transactions().sync({
						identifiers: walletIdentifiers,
					});
				} finally {
					setConfiguration({ profileIsSyncingWallets: false });
				}
			},
			interval: Intervals.VeryShort,
		};

		// Syncing delegates is necessary for every domain not only votes,
		// Because it's used in wallet and transaction lists
		const syncDelegates = {
			callback: () => env.delegates().syncAll(profile),
			interval: Intervals.Long,
		};

		const syncExchangeRates = {
			callback: async () => {
				setConfiguration({ profileIsSyncingExchangeRates: true });

				const currencies = Object.keys(profile.coins().all());
				const allRates = await Promise.all(
					currencies.map((currency) => env.exchangeRates().syncAll(profile, currency)),
				);

				setConfiguration({ profileIsSyncingExchangeRates: false });

				return allRates;
			},
			interval: Intervals.Long,
		};

		const syncNotifications = {
			callback: () => profile.notifications().transactions().sync(),
			interval: Intervals.Long,
		};

		const syncKnownWallets = {
			callback: () => env.knownWallets().syncAll(profile),
			interval: Intervals.Long,
		};

		const syncPendingMusigWallets = {
			callback: () => profile.pendingMusigWallets().sync(),
			interval: Intervals.VeryShort,
		};

		const syncServerStatus = {
			callback: async () => {
				setConfiguration({ serverStatus: await ProfilePeers(env, profile).healthStatusByNetwork() });
			},
			interval: Intervals.Long,
		};

		return {
			allJobs: [
				syncExchangeRates,
				syncNotifications,
				syncKnownWallets,
				syncDelegates,
				syncProfileWallets,
				syncPendingMusigWallets,
				syncServerStatus,
			],
			syncExchangeRates: syncExchangeRates.callback,
			syncProfileWallets: syncProfileWallets.callback,
			syncServerStatus: syncServerStatus.callback,
		};
	}, [env, profile, walletsCount, setConfiguration]); // eslint-disable-line react-hooks/exhaustive-deps
};

interface ProfileSyncState {
	status: string | null;
	restored: string[];
}

export const useProfileSyncStatus = () => {
	const { profileIsRestoring, setConfiguration } = useConfiguration();
	const { current } = useRef<ProfileSyncState>({
		restored: [],
		status: "idle",
	});

	const isIdle = () => current.status === "idle";
	const isRestoring = () => profileIsRestoring || current.status === "restoring";
	const isSyncing = () => current.status === "syncing";
	const isSynced = () => current.status === "synced";
	const isCompleted = () => current.status === "completed";

	const shouldRestore = (profile: Contracts.IProfile) => {
		// For unit tests only. This flag prevents from running restore multiple times
		// as the profiles are all restored before all (see vi.setup)
		const isRestoredInTests = process.env.TEST_PROFILES_RESTORE_STATUS === "restored";
		if (isRestoredInTests) {
			return false;
		}

		return !isSyncing() && !isRestoring() && !isSynced() && !isCompleted() && !profile.status().isRestored();
	};

	const shouldSync = () => !isSyncing() && !isRestoring() && !isSynced() && !isCompleted();

	const shouldMarkCompleted = () => isSynced() && !isCompleted();

	const markAsRestored = (profileId: string) => {
		current.status = "restored";
		current.restored.push(profileId);
		setConfiguration({ profileIsRestoring: false });
	};

	const resetStatuses = (profiles: Contracts.IProfile[]) => {
		current.status = "idle";
		current.restored = [];
		setConfiguration({ profileIsRestoring: false, profileIsSyncing: true });
		for (const profile of profiles) {
			profile.status().reset();
			profile.password().forget();
		}
	};

	const setStatus = (status: string) => {
		current.status = status;
		if (status === "restoring") {
			setConfiguration({ profileIsRestoring: true, profileIsSyncingExchangeRates: true });
		}

		if (status === "syncing") {
			setConfiguration({ profileIsSyncingExchangeRates: true });
		}

		if (status === "idle") {
			setConfiguration({ profileIsSyncingExchangeRates: true });
		}
	};

	return {
		isCompleted,
		isIdle,
		markAsRestored,
		resetStatuses,
		setStatus,
		shouldMarkCompleted,
		shouldRestore,
		shouldSync,
		status: () => current.status,
	};
};

export const useProfileRestore = () => {
	const { shouldRestore, markAsRestored, setStatus } = useProfileSyncStatus();
	const { persist, env } = useEnvironmentContext();
	const { setConfiguration } = useConfiguration();
	const history = useHistory();

	const restoreProfileConfig = (profile: Contracts.IProfile) => {
		const defaultConfiguration: DashboardConfiguration = {
			selectedNetworkIds: profileEnabledNetworkIds(profile),
			walletsDisplayType: "all",
		};

		const config = profile
			.settings()
			.get(Contracts.ProfileSetting.DashboardConfiguration, defaultConfiguration) as DashboardConfiguration;

		setConfiguration({ dashboard: config });
	};

	const restoreProfile = async (profile: Contracts.IProfile, passwordInput?: string) => {
		if (!shouldRestore(profile)) {
			return false;
		}

		const password = passwordInput || getProfileStoredPassword(profile);

		setStatus("restoring");

		// Reset profile normally (passwordless or not)
		await env.profiles().restore(profile, password);
		markAsRestored(profile.id());

		// Restore profile's config
		restoreProfileConfig(profile);

		// Profile restore finished but url changed in the meanwhile.
		// Prevent from unnecessary save of old profile.
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		const activeProfile = getProfileFromUrl(env, history?.location?.pathname);
		if (activeProfile?.id() !== profile.id()) {
			return;
		}

		await persist();
		return true;
	};

	return {
		restoreProfile,
		restoreProfileConfig,
	};
};

interface ProfileStatusWatcherProperties {
	onProfileSyncError?: (failedNetworkNames: string[], retrySync: () => void) => void;
	onProfileSyncStart?: () => void;
	onProfileSyncComplete?: () => void;
	onProfileSignOut?: () => void;
	profile?: Contracts.IProfile;
}

export const useProfileStatusWatcher = ({
	profile,
	onProfileSyncError,
	onProfileSyncComplete,
}: ProfileStatusWatcherProperties) => {
	const {
		setConfiguration,
		profileIsSyncing,
		profileIsSyncingWallets,
		profileHasSyncedOnce,
		profileErroredNetworks,
		isProfileInitialSync,
	} = useConfiguration();

	const previousErroredNetworks = usePrevious(profileErroredNetworks) || [];

	const walletsCount = profile?.wallets().count();

	useEffect(() => {
		if (!profile || walletsCount === 0) {
			return;
		}

		if (!profileHasSyncedOnce || profileIsSyncingWallets) {
			return;
		}

		const { erroredNetworks } = getErroredNetworks(profile);
		const isStatusChanged = !isEqual(erroredNetworks, previousErroredNetworks);

		// Prevent from showing network status toasts on every sync.
		// Show them only on the initial sync and then when failed networks change.
		if (!isProfileInitialSync && !isStatusChanged) {
			return;
		}

		setConfiguration({ profileErroredNetworks: erroredNetworks });

		if (erroredNetworks.length > 0) {
			onProfileSyncError?.(erroredNetworks, () => {
				setConfiguration({ isProfileInitialSync: true });
			});
		}

		if (erroredNetworks.length === 0) {
			onProfileSyncComplete?.();
		}

		setConfiguration({ isProfileInitialSync: false });
	}, [profileIsSyncingWallets, profileIsSyncing, profileHasSyncedOnce, profile, walletsCount]); // eslint-disable-line react-hooks/exhaustive-deps
};

interface ProfileSynchronizerProperties {
	onProfileSyncError?: (failedNetworkNames: string[], retrySync: () => void) => void;
	onProfileRestoreError?: (error: TypeError) => void;
	onProfileSyncStart?: () => void;
	onProfileSyncComplete?: () => void;
	onProfileSignOut?: () => void;
	onProfileUpdated?: () => void;
	onLedgerCompatibilityError?: () => void;
}

export const useProfileSynchronizer = ({
	onProfileRestoreError,
	onProfileSyncError,
	onProfileSyncStart,
	onProfileSyncComplete,
	onProfileSignOut,
	onProfileUpdated,
	onLedgerCompatibilityError,
}: ProfileSynchronizerProperties = {}) => {
	const location = useLocation();
	const { env, persist } = useEnvironmentContext();
	const { setConfiguration, profileIsSyncing, profileHasSyncedOnce } = useConfiguration();
	const { restoreProfile } = useProfileRestore();
	const profile = useProfileWatcher();
	const { hideSupportChat } = useZendesk();

	const { shouldRestore, shouldSync, shouldMarkCompleted, setStatus, status, markAsRestored, resetStatuses } =
		useProfileSyncStatus();

	const { allJobs, syncProfileWallets } = useProfileJobs(profile);
	const { start, stop, runAll } = useSynchronizer(allJobs);
	const { setProfileTheme, resetTheme } = useTheme();
	const { startIdleTimer, resetIdleTimer } = useAutoSignOut(profile);
	const { setProfileAccentColor, resetAccentColor } = useAccentColor();
	const [activeProfileId, setActiveProfileId] = useState<string | undefined>();
	const lastPathname = useRef<string | undefined>();

	const history = useHistory();

	useProfileStatusWatcher({
		onProfileSyncComplete,
		onProfileSyncError: (erroredNetworks: string[], resetStatus) => {
			onProfileSyncError?.(erroredNetworks, () => {
				resetStatus();
				onProfileSyncStart?.();
				syncProfileWallets?.();
			});
		},
		profile,
	});

	useEffect(() => {
		const currentProfileId = profile?.id();
		if (activeProfileId !== undefined && currentProfileId !== undefined && currentProfileId !== activeProfileId) {
			onProfileUpdated?.();
		}
		setActiveProfileId(currentProfileId);
	}, [profile, onProfileUpdated]);

	const profileSyncing = useCallback(
		async (profile: Contracts.IProfile) => {
			if (!shouldSync()) {
				return;
			}

			setStatus("syncing");

			if (profile.wallets().count() > 0 && !profileHasSyncedOnce) {
				onProfileSyncStart?.();
			}

			try {
				// If the user only has one network, we skip the network selection
				// step when creating or importing a wallet, which means we also
				// skip that part of syncing network coin. The issues caused by that
				// are solved by syncing the coin initially.
				const availableNetworks = profileAllEnabledNetworks(profile);
				const onlyHasOneNetwork = enabledNetworksCount(profile) === 1;
				if (onlyHasOneNetwork) {
					const coin = profile.coins().set(availableNetworks[0].coin(), availableNetworks[0].id());
					await Promise.all([coin.__construct(), profile.sync()]);
				} else {
					await profile.sync();
				}

				await persist();
				setStatus("synced");
			} catch {
				const { erroredNetworks } = getErroredNetworks(profile);
				if (erroredNetworks.length > 0) {
					onProfileSyncError?.(erroredNetworks, () => {
						onProfileSyncStart?.();
						syncProfileWallets?.();
					});
				}
			}
		},
		[
			getErroredNetworks,
			onProfileSyncError,
			onProfileSyncStart,
			persist,
			profileHasSyncedOnce,
			setStatus,
			shouldSync,
			syncProfileWallets,
		],
	);

	useEffect(() => {
		const clearProfileSyncStatus = () => {
			if (status() === "idle") {
				return;
			}

			hideSupportChat();
			resetTheme();
			resetIdleTimer();
			resetAccentColor();

			resetStatuses(env.profiles().values());
			setConfiguration({ profileErroredNetworks: [] });

			stop({ clearTimers: true });
		};

		const syncProfile = async (profile?: Contracts.IProfile) => {
			if (!profile) {
				if (location.pathname === lastPathname.current) {
					return;
				}

				onProfileSignOut?.();
				clearProfileSyncStatus();

				lastPathname.current = location.pathname;

				return;
			}

			lastPathname.current = location.pathname;

			if (profile.usesPassword()) {
				try {
					profile.password().get();
				} catch (error) {
					onProfileRestoreError?.(error);
					return;
				}
			}

			if (shouldRestore(profile)) {
				await restoreProfile(profile);

				setProfileTheme(profile);
				setProfileAccentColor(profile);

				startIdleTimer();

				if (hasIncompatibleLedgerWallets(profile)) {
					onLedgerCompatibilityError?.();
				}
			}

			await profileSyncing(profile);

			if (shouldMarkCompleted() && profileIsSyncing) {
				// for better performance no need to await
				runAll();

				// Start background jobs after initial sync
				start();

				setStatus("completed");
				setConfiguration({ profileHasSyncedOnce: true, profileIsSyncing: false });
			}
		};

		delay(() => syncProfile(profile), 0);
	}, [
		env,
		resetAccentColor,
		resetTheme,
		setProfileTheme,
		setProfileAccentColor,
		allJobs,
		profile,
		runAll,
		start,
		persist,
		setConfiguration,
		shouldMarkCompleted,
		shouldRestore,
		shouldSync,
		setStatus,
		profileIsSyncing,
		markAsRestored,
		restoreProfile,
		status,
		onProfileRestoreError,
		onProfileSyncError,
		onProfileSyncStart,
		onProfileSyncComplete,
		resetStatuses,
		history,
		onProfileSignOut,
		getErroredNetworks,
		syncProfileWallets,
		profileHasSyncedOnce,
		stop,
		profileSyncing,
	]);

	return { profile, profileIsSyncing };
};
