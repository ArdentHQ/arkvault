import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";

export type TransactionRowProperties = {
	transaction: DTO.ExtendedConfirmedTransactionData;
	exchangeCurrency?: string;
	onClick?: () => void;
	isLoading?: boolean;
	profile: Contracts.IProfile;
} & React.HTMLProps<any>;
