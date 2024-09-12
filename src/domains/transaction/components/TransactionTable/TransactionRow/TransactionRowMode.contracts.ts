import { DTO } from "@ardenthq/sdk-profiles";
import React from "react";

export interface BaseTransactionRowModeProperties extends React.HTMLAttributes<HTMLDivElement> {
	type: string;
	isSent: boolean;
	isReturn?: boolean;
	address: string;
}

export interface TransactionRowModeProperties extends React.HTMLAttributes<HTMLDivElement> {
	transaction: DTO.ExtendedConfirmedTransactionData;
	transactionType?: string;
	address?: string;
}
