import { MigrationTransactionStatus } from "@/domains/migration/migration.contracts";

export interface MigrationTransactionsTableProperties {
	migrationTransactions?: any[];
	isCompact: boolean;
	isLoading: boolean;
	isLoadingMore?: boolean;
	hasMore?: boolean;
	onClick: () => void;
	onLoadMore?: () => void;
}

export interface MigrationTransactionsRowStatusProperties {
	status: MigrationTransactionStatus;
}
