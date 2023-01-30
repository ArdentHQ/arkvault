import { Migration, MigrationTransactionStatus } from "@/domains/migration/migration.contracts";

export interface MigrationTransactionsTableProperties {
	migrationTransactions?: Migration[];
	isCompact: boolean;
	isLoading: boolean;
	isLoadingMore?: boolean;
	hasMore?: boolean;
	onClick: (migrationTransaction: Migration) => void;
	onLoadMore?: () => void;
}

export interface MigrationTransactionsRowStatusProperties {
	status?: MigrationTransactionStatus;
}
