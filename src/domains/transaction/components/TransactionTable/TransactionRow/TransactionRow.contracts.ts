import React from "react";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";

export type TransactionRowProperties = {
	transaction: DTO.ExtendedConfirmedTransactionData;
	exchangeCurrency?: string;
	onClick?: () => void;
	onShowMigrationDetails?: (transaction: DTO.ExtendedConfirmedTransactionData) => void;
	isLoading?: boolean;
	profile: Contracts.IProfile;
} & React.HTMLProps<any>;
