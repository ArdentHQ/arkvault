import { BigNumber } from "ethers";
import { DTO } from "@ardenthq/sdk-profiles";

export type MigrationTransaction = DTO.ExtendedConfirmedTransactionData | DTO.ExtendedSignedTransactionData;

export enum MigrationTransactionStatus {
	Confirmed = "confirmed",
	Pending = "pending",
}

export interface Migration {
	address: string;
	id: string;
	amount: number;
	migrationId?: string;
	migrationAddress: string;
	status?: MigrationTransactionStatus;
	timestamp: number;
	readAt?: number;
}

export type ARKMigrationViewStructOutput = [string, BigNumber, string] & {
	recipient: string;
	amount: BigNumber;
	arkTxHash: string;
	txHash: string;
};
