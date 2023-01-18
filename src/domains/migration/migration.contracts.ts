import { BigNumber } from "ethers";

export enum MigrationTransactionStatus {
	Waiting = "waiting",
	Confirmed = "confirmed",
}
export interface Migration {
	address: string;
	id: string;
	amount: number;
	migrationAddress: string;
	status: MigrationTransactionStatus;
	timestamp: number;
}

export type ARKMigrationViewStructOutput = [string, BigNumber, string] & {
	recipient: string;
	amount: BigNumber;
	arkTxHash: string;
};
