export interface MigrationTransactionsTableProperties {
	migrationTransactions: any[];
	isCompact: boolean;
	onClick: () => void;
}

export interface MigrationTransactionsRowStatusProperties {
	status: MigrationTransactionStatus;
}

export enum MigrationTransactionStatus {
	Waiting = "waiting",
	Confirmed = "confirmed",
}
