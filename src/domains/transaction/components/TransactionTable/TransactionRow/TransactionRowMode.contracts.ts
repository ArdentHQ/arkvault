import { DTO } from "@payvo/sdk-profiles";
import React from "react";

export interface BaseTransactionRowModeProperties extends React.HTMLAttributes<HTMLDivElement> {
	type: string;
	isSent: boolean;
	isReturn?: boolean;
	address: string;
	isCompact: boolean;
}

export interface TransactionRowModeProperties extends React.HTMLAttributes<HTMLDivElement> {
	transaction: DTO.ExtendedConfirmedTransactionData;
	transactionType?: string;
	address?: string;
	isCompact: boolean;
}
