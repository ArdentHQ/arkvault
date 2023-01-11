import { Contracts } from "@ardenthq/sdk-profiles";
import { useMemo } from "react";
import { MigrationTransactionStatus } from "@/domains/migration/migration.contracts";

// @TBD: using the same format as the ones on `refactor/migration-table` branch
// @TODO: assign a proper type for this
const fakeMigrations: any[] = [
	{
		address: "AXzxJ8Ts3dQ2bvBR1tPE7GUee9iSEJb8HX",
		amount: 123,
		id: "id",
		migrationAddress: "0x0000000000000000000000000000000000000000",
		status: MigrationTransactionStatus.Confirmed,
		timestamp: Date.now() / 1000,
	},
	{
		address: "AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX",
		amount: 123,
		migrationAddress: "0x0000000000000000000000000000000000000000",
		status: MigrationTransactionStatus.Confirmed,
		timestamp: Date.now() / 1000,
	},
];

export const useNotifications = ({ profile }: { profile: Contracts.IProfile }) => {
	const isSyncing = profile.notifications().transactions().isSyncing();

	const { markAllTransactionsAsRead, markAsRead, releases, transactions, migrationTransactions } = useMemo(() => {
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
			migrationTransactions: fakeMigrations,
			releases: profile.notifications().releases().recent(),
			transactions: profile.notifications().transactions().transactions(),
		};
	}, [profile, isSyncing]); // eslint-disable-line react-hooks/exhaustive-deps

	return {
		hasUnread: (releases.length > 0 || transactions.length > 0) && profile.notifications().hasUnread(),
		markAllTransactionsAsRead,
		markAsRead,
		migrationTransactions,
		releases,
		transactions,
	};
};
