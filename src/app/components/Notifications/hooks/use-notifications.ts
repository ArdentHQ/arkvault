import { Contracts } from "@payvo/sdk-profiles";
import { useMemo } from "react";

export const useNotifications = ({ profile }: { profile: Contracts.IProfile }) => {
	const isSyncing = profile.notifications().transactions().isSyncing();

	const { markAllTransactionsAsRead, markAsRead, releases, transactions } = useMemo(() => {
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
			releases: profile.notifications().releases().recent(),
			transactions: profile.notifications().transactions().transactions(),
		};
	}, [profile, isSyncing]); // eslint-disable-line react-hooks/exhaustive-deps

	return {
		hasUnread: (releases.length > 0 || transactions.length > 0) && profile.notifications().hasUnread(),
		markAllTransactionsAsRead,
		markAsRead,
		releases,
		transactions,
	};
};
