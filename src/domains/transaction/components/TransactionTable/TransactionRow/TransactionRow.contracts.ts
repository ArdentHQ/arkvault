import React from "react";
import { Contracts, DTO } from "@/app/lib/profiles";

export type TransactionRowProperties = {
	transaction: DTO.ExtendedConfirmedTransactionData;
	exchangeCurrency?: string;
	onClick?: () => void;
	isLoading?: boolean;
	profile: Contracts.IProfile;
	hideSender?: boolean;
} & React.HTMLProps<any>;
