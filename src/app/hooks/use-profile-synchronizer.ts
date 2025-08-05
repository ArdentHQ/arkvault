import {
	getErroredNetworks,
	getProfileFromUrl,
	getProfileStoredPassword,
	hasIncompatibleLedgerWallets,
} from "@/utils/profile-utils";
import { useLocation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useConfiguration, useEnvironmentContext } from "@/app/contexts";

import { Contracts } from "@/app/lib/profiles";
import { delay } from "@/utils/delay";
import { isEqual } from "@/app/lib/helpers";
import { useAutoSignOut } from "@/app/hooks/use-auto-signout";
import { usePrevious } from "./use-previous";
import { useTheme } from "./use-theme";
import { useZendesk } from "@/app/contexts/Zendesk";
import { useProfileJobs } from "./use-profile-background-jobs";

const useProfileWatcher = () => {
	const location = useLocation();
	const { env } = useEnvironmentContext();

	return getProfileFromUrl(env, location.pathname);
};

interface ProfileSyncState {
	status: string | null;
	restored: string[];
}

export const useProfileSyncStatus = (profileId: string) => {
	const { getProfileConfiguration, setConfiguration } = useConfiguration();
	const syncStates = useRef<Map<string, ProfileSyncState>>(new Map());

	const getCurrentState = (): ProfileSyncState => {
		if (!syncStates.current.has(profileId)) {
			syncStates.current.set(profileId, { restored: [], status: "idle" });
		}
		return syncStates.current.get(profileId)!;
	};

	const isIdle = () => getCurrentState().status === "idle";
	const isRestoring = () =>
		getProfileConfiguration(profileId).profileIsRestoring || getCurrentState().status === "restoring";
	const isSyncing = () => getCurrentState().status === "syncing";
	const isSynced = () => getCurrentState().status === "synced";
	const isCompleted = () => getCurrentState().status === "completed";

	const shouldRestore = (profile: Contracts.IProfile) => {
		if (profile.id() !== profileId) {
			return false;
		}
		const isRestoredInTests = process.env.TEST_PROFILES_RESTORE_STATUS === "restored";
		if (isRestoredInTests) {
			return false;
		}
		return !isSyncing() && !isRestoring() && !isSynced() && !isCompleted() && !profile.status().isRestored();
	};

	const shouldSync = () => !isSyncing() && !isRestoring() && !isSynced() && !isCompleted();

	const shouldMarkCompleted = () => isSynced() && !isCompleted();

	const markAsRestored = () => {
		const current = getCurrentState();
		current.status = "restored";
		current.restored.push(profileId);
		setConfiguration(profileId, { profileIsRestoring: false });
	};

	const resetStatuses = () => {
		const current = getCurrentState();
		current.status = "idle";
		current.restored = [];
		setConfiguration(profileId, { profileIsRestoring: false, profileIsSyncing: true });
	};

	const setStatus = (status: string) => {
		const current = getCurrentState();
		current.status = status;
		if (status === "restoring") {
			setConfiguration(profileId, { profileIsRestoring: true, profileIsSyncingExchangeRates: true });
		}
		if (status === "syncing") {
			setConfiguration(profileId, { profileIsSyncingExchangeRates: true });
		}
		if (status === "idle") {
			setConfiguration(profileId, { profileIsSyncingExchangeRates: true });
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
		status: () => getCurrentState().status,
	};
};

export const useProfileRestore = (profileId: string) => {
	const { shouldRestore, markAsRestored, setStatus } = useProfileSyncStatus(profileId);
	const { persist, env } = useEnvironmentContext();
	const location = useLocation();

	const restoreProfile = async (profile: Contracts.IProfile, passwordInput?: string) => {
		if (!shouldRestore(profile)) {
			return false;
		}

		const password = passwordInput || getProfileStoredPassword(profile);

		setStatus("restoring");
		await env.profiles().restore(profile, password);
		markAsRestored();

		const activeProfile = getProfileFromUrl(env, location.pathname);
		if (activeProfile?.id() !== profile.id()) {
			return;
		}

		await persist();

		return true;
	};

	return { restoreProfile };
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
	const { setConfiguration, getProfileConfiguration } = useConfiguration();
	const profileId = profile?.id();
	const profileConfig = profileId ? getProfileConfiguration(profileId) : {};

	const previousErroredNetworks = usePrevious(profileConfig.profileErroredNetworks) || [];
	const walletsCount = profile?.wallets().count();

	useEffect(() => {
		if (!profile || !profileId || walletsCount === 0) {
			return;
		}

		if (!profileConfig.profileHasSyncedOnce || profileConfig.profileIsSyncingWallets) {
			return;
		}

		const { erroredNetworks } = getErroredNetworks(profile);
		const isStatusChanged = !isEqual(erroredNetworks, previousErroredNetworks);

		if (!profileConfig.isProfileInitialSync && !isStatusChanged) {
			return;
		}

		setConfiguration(profileId, { profileErroredNetworks: erroredNetworks });

		if (erroredNetworks.length > 0) {
			onProfileSyncError?.(erroredNetworks, () => {
				setConfiguration(profileId, { isProfileInitialSync: true });
			});
		}

		if (erroredNetworks.length === 0) {
			onProfileSyncComplete?.();
		}

		setConfiguration(profileId, { isProfileInitialSync: false });
	}, [
		profileConfig,
		profile,
		walletsCount,
		profileId,
		setConfiguration,
		onProfileSyncError,
		onProfileSyncComplete,
		previousErroredNetworks,
	]);
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
	const { setConfiguration, getProfileConfiguration } = useConfiguration();
	const profile = useProfileWatcher();
	const profileId = profile?.id() || "";
	const { hideSupportChat } = useZendesk();

	const { shouldRestore, shouldSync, shouldMarkCompleted, setStatus, status, markAsRestored, resetStatuses } =
		useProfileSyncStatus(profileId);

	const { restoreProfile } = useProfileRestore(profileId);
	const { syncProfileWallets } = useProfileJobs(profile);
	const { setProfileTheme, resetTheme } = useTheme();
	const { startIdleTimer, resetIdleTimer } = useAutoSignOut(profile);
	const [activeProfileId, setActiveProfileId] = useState<string | undefined>();
	const lastPathname = useRef<string>(undefined);

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

			const profileConfig = getProfileConfiguration(profileId);
			if (profile.wallets().count() > 0 && !profileConfig.profileHasSyncedOnce) {
				onProfileSyncStart?.();
			}

			try {
				await profile.sync({ ttl: 10_000 });
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
			getProfileConfiguration,
			profileId,
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
			resetStatuses();
			setConfiguration(profileId, { profileErroredNetworks: [] });
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
				startIdleTimer();

				if (hasIncompatibleLedgerWallets(profile)) {
					onLedgerCompatibilityError?.();
				}
			}

			await profileSyncing(profile);

			const profileConfig = getProfileConfiguration(profileId);
			if (shouldMarkCompleted() && profileConfig.profileIsSyncing) {
				setStatus("completed");
				setConfiguration(profileId, { profileHasSyncedOnce: true, profileIsSyncing: false });
			}
		};

		delay(() => syncProfile(profile), 0);
	}, [
		env,
		resetTheme,
		setProfileTheme,
		profile,
		persist,
		setConfiguration,
		getProfileConfiguration,
		profileId,
		shouldMarkCompleted,
		shouldRestore,
		shouldSync,
		setStatus,
		markAsRestored,
		restoreProfile,
		status,
		onProfileRestoreError,
		onProfileSyncError,
		onProfileSyncStart,
		onProfileSyncComplete,
		resetStatuses,
		onProfileSignOut,
		getErroredNetworks,
		syncProfileWallets,
		profileSyncing,
	]);

	return { profile, profileIsSyncing: getProfileConfiguration(profileId).profileIsSyncing };
};
