import { Contracts } from "@ardenthq/sdk-profiles";
import { useEffect, useMemo, useState } from "react";
import { Migration, MigrationTransactionStatus } from "@/domains/migration/migration.contracts";
import { useMigrations } from "@/app/contexts";
export const useNotifications = ({ profile }: { profile: Contracts.IProfile }) => {
	const isSyncing = profile.notifications().transactions().isSyncing();

	const { migrations, markMigrationAsRead } = useMigrations();
	const [confirmedMigrations, setConfirmedMigrations] = useState<Migration[]>([]);

	useEffect(() => {
		if (migrations === undefined) {
			return;
		}

		setConfirmedMigrations(
			migrations.filter(
				(migration) =>
					migration.status === MigrationTransactionStatus.Confirmed &&
					(migration.readAt === undefined ||
						// If were loaded on the session we should kept it to avoid
						// immediately hide the notification
						confirmedMigrations.some((confirmedMigration) => confirmedMigration.id === migration.id)),
			),
		);
	}, [migrations, confirmedMigrations]);

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
			migrationTransactions: confirmedMigrations,
			releases: profile.notifications().releases().recent(),
			transactions: profile.notifications().transactions().transactions(),
		};
	}, [profile, isSyncing, confirmedMigrations]); // eslint-disable-line react-hooks/exhaustive-deps

	return {
		hasUnread: (releases.length > 0 || transactions.length > 0) && profile.notifications().hasUnread(),
		markAllTransactionsAsRead,
		markAsRead,
		markMigrationAsRead,
		migrationTransactions,
		releases,
		transactions,
	};
};
