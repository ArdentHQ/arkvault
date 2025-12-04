import React from "react";
import { Contracts } from "@/app/lib/profiles";
import { ExtendedTransactionDTO } from "@/domains/transaction/components/TransactionTable";

export type TransactionRowProperties = {
	transaction: ExtendedTransactionDTO;
	exchangeCurrency?: string;
	onClick?: () => void;
	isLoading?: boolean;
	profile: Contracts.IProfile;
	hideSender?: boolean;
	decimals?: number;
} & React.HTMLProps<any>;
