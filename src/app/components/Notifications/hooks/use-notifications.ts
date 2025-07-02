import { Contracts, DTO } from "@/app/lib/profiles";
import { useMemo } from "react";

export const useNotifications = ({ profile }: { profile: Contracts.IProfile }) => {
	const isSyncing = profile.notifications().transactions().isSyncing();

	const isNotificationUnread = (transaction: DTO.ExtendedConfirmedTransactionData) =>
		Object.values(profile.notifications().all()).some((notification) => {
			const isUnread = notification.read_at === undefined;
			return notification.meta.transactionId === transaction.hash() && isUnread;
		});

	const { markAllTransactionsAsRead, markAsRead, transactions } = useMemo(() => {
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

		return {
			markAllTransactionsAsRead,
			markAsRead,
			transactions: profile.notifications().transactions().transactions(),
		};
	}, [profile, isSyncing]);

	return {
		hasUnread: transactions.length > 0 && profile.notifications().hasUnread(),
		isNotificationUnread,
		markAllTransactionsAsRead,
		markAsRead,
		transactions,
	};
};
