import { Contracts, DTO } from "@ardenthq/sdk-profiles";

import { WalletAliasResult } from "@/app/hooks";

export interface TransactionAliases {
	sender: WalletAliasResult;
	recipients: WalletAliasResult[];
}

export interface TransactionDetailModalProperties {
	isOpen: boolean;
	transactionItem: DTO.ExtendedConfirmedTransactionData | DTO.ExtendedConfirmedTransactionData;
	profile: Contracts.IProfile;
	onClose?: any;
}

export interface TransactionDetailProperties {
	isOpen: boolean;
	transaction: DTO.ExtendedConfirmedTransactionData;
	aliases?: TransactionAliases;
	onClose?: any;
	profile: Contracts.IProfile;
}
