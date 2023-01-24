import { Migration, MigrationTransactionStatus } from "@/domains/migration/migration.contracts";

export interface MigrationTransactionsTableProperties {
	migrationTransactions?: Migration[];
	isCompact: boolean;
	isLoading: boolean;
	onClick: (migrationTransaction: Migration) => void;
}

export interface MigrationTransactionsRowStatusProperties {
	status: MigrationTransactionStatus;
}
