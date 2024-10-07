import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { useMemo } from "react";

export const useNotifications = ({ profile }: { profile: Contracts.IProfile }) => {
	const isSyncing = profile.notifications().transactions().isSyncing();

	const isNotificationUnread = (transaction: DTO.ExtendedConfirmedTransactionData) =>
		Object.values(profile.notifications().all()).some((notification) => {
			const isUnread = notification.read_at === undefined;
			return notification.meta.transactionId === transaction.id() && isUnread;
		});

	const { markAllTransactionsAsRead, markAsRead, releases, transactions } = useMemo(() => {
		const markAllTransactionsAsRead = (isVisible: boolean) => {
			if (!isVisible) {
				return;
			}

			profile.notifications().transactions().markAllAsRead();

			for (const notification of profile.notifications().releases().recent()) {
				profile.notifications().markAsRead(notification.id);
			}
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
			releases: profile.notifications().releases().recent(),
			transactions: profile.notifications().transactions().transactions(),
		};
	}, [profile, isSyncing]); // eslint-disable-line react-hooks/exhaustive-deps

	return {
		hasUnread: (releases.length > 0 || transactions.length > 0) && profile.notifications().hasUnread(),
		isNotificationUnread,
		markAllTransactionsAsRead,
		markAsRead,
		releases,
		transactions,
	};
};
