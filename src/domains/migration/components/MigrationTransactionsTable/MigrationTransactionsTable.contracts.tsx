import { MigrationTransaction, MigrationTransactionStatus } from "@/domains/migration/migration.contracts";

export interface MigrationTransactionsTableProperties {
	migrationTransactions?: MigrationTransaction[];
	isCompact: boolean;
	isLoading: boolean;
	onClick: () => void;
}

export interface MigrationTransactionsRowStatusProperties {
	status: MigrationTransactionStatus;
}
