import { MigrationTransactionStatus } from "@/domains/migration/migration.contracts";

export interface MigrationTransactionsTableProperties {
	migrationTransactions?: any[];
	isCompact: boolean;
	isLoading: boolean;
	onClick: () => void;
}

export interface MigrationTransactionsRowStatusProperties {
	status: MigrationTransactionStatus;
}
