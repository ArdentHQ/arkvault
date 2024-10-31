import React from "react";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";

export type TransactionRowProperties = {
	transaction: DTO.ExtendedConfirmedTransactionData;
	exchangeCurrency?: string;
	onClick?: () => void;
	isLoading?: boolean;
	profile: Contracts.IProfile;
	hint?: string;
} & React.HTMLProps<any>;
