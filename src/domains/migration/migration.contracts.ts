import { BigNumber } from "ethers";
import { DTO } from "@ardenthq/sdk-profiles";
export enum MigrationTransactionStatus {
	Confirmed = "confirmed",
	Pending = "pending",
}

export interface Migration {
	transactionId: string;
	walletId: string;
	status: MigrationTransactionStatus;
}
export interface MigrationTransaction {
	transaction: DTO.ExtendedConfirmedTransactionData | DTO.ExtendedSignedTransactionData;
	status: MigrationTransactionStatus;
}

export type ProfileMigrations = Record<string, Migration[]>;

export type ARKMigrationViewStructOutput = [string, BigNumber, string] & {
	recipient: string;
	amount: BigNumber;
	arkTxHash: string;
};
