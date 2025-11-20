import { useEnvironmentContext } from "@/app/contexts";
import { Contracts, DTO } from "@/app/lib/profiles";
import { useEffect, useCallback, useState } from "react";

export const useNotifications = ({ profile }: { profile: Contracts.IProfile }) => {
	const isSyncing = profile.notifications().transactions().isSyncing();
	const transactions = profile.notifications().transactions().active();
	const [liveNotifications, setLiveNotifications] = useState(Object.values(profile.notifications().all()));
	const { persist } = useEnvironmentContext();

	useEffect(() => {
		void profile.notifications().transactions().hydrateFromCache();
	}, [profile]);

	const triggerInitialSync = useCallback(async () => {
		const hasLiveData = transactions.length > 0;

		if (!hasLiveData && !isSyncing) {
			try {
				await profile.notifications().transactions().sync();
			} catch (error) {
				/* istanbul ignore next -- @preserve */
				console.error("Failed to sync notifications on initialization:", error);
			}
		}
	}, [profile, isSyncing, transactions.length, liveNotifications]);

	useEffect(() => {
		triggerInitialSync();
	}, [triggerInitialSync]);

	const isNotificationUnread = (transaction: DTO.ExtendedConfirmedTransactionData) =>
		liveNotifications.some((notification) => {
			const isUnread = notification.read_at === undefined;
			return notification.meta?.transactionId === transaction.hash() && isUnread;
		});

	const markAllAsRead = async () => {
		profile.notifications().transactions().markAllAsRead();
		setLiveNotifications(Object.values(profile.notifications().all()));
		await persist();
	};

	const markAsRead = async (transactionId: string) => {
		profile.notifications().transactions().markAsRead(transactionId);
		setLiveNotifications(Object.values(profile.notifications().all()));
		await persist();
	};

	const markAsRemoved = async (transactionId: string) => {
		profile.notifications().transactions().markAsRemoved(transactionId);
		setLiveNotifications(Object.values(profile.notifications().all()));
		await persist();
	};

	const markAllAsRemoved = async () => {
		profile.notifications().transactions().markAllAsRemoved();
		setLiveNotifications(Object.values(profile.notifications().all()));
		await persist();
	};

	return {
		hasUnread: transactions.length > 0 && profile.notifications().hasUnread(),
		isNotificationUnread,
		isSyncing,
		markAllAsRead,
		markAllAsRemoved,
		markAsRead,
		markAsRemoved,
		transactions,
	};
};
