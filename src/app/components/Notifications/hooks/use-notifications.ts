import { Contracts, DTO } from "@/app/lib/profiles";
import { useMemo, useEffect, useCallback } from "react";

export const useNotifications = ({ profile }: { profile: Contracts.IProfile }) => {
	const isSyncing = profile.notifications().transactions().isSyncing();
	const liveTransactions = profile.notifications().transactions().transactions();
	const liveNotifications = Object.values(profile.notifications().all());

	const transactions = useMemo<DTO.ExtendedConfirmedTransactionData[]>(() => liveTransactions, [liveTransactions]);

	useEffect(() => {
		void profile.notifications().transactions().hydrateFromCache();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [profile]);

	const triggerInitialSync = useCallback(async () => {
		const hasLiveData = liveTransactions.length > 0;

		if (!hasLiveData && !isSyncing) {
			try {
				await profile.notifications().transactions().sync();
			} catch (error) {
				/* istanbul ignore next -- @preserve */
				console.error("Failed to sync notifications on initialization:", error);
			}
		}
	}, [profile, isSyncing, liveTransactions.length]);

	useEffect(() => {
		triggerInitialSync();
	}, [triggerInitialSync]);

	const isNotificationUnread = (transaction: DTO.ExtendedConfirmedTransactionData) =>
		liveNotifications.some((notification) => {
			const isUnread = notification.read_at === undefined;
			return notification.meta?.transactionId === transaction.hash() && isUnread;
		});

	const { markAllTransactionsAsRead, markAsRead } = useMemo(() => {
		const markAllTransactionsAsRead = (isVisible: boolean) => {
			if (!isVisible) {
				return;
			}
			profile.notifications().transactions().markAllAsRead();
		};

		const markAsRead = (isVisible: boolean, id: string) => {
			if (!isVisible) {
				return;
			}
			profile.notifications().markAsRead(id);
		};

		return { markAllTransactionsAsRead, markAsRead };
	}, [profile]);

	return {
		hasUnread: transactions.length > 0 && profile.notifications().hasUnread(),
		isNotificationUnread,
		isSyncing,
		markAllTransactionsAsRead,
		markAsRead,
		transactions,
	};
};
