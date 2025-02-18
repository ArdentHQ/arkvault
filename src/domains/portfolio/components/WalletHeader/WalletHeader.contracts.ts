import { Contracts } from "@ardenthq/sdk-profiles";

export interface WalletHeaderProperties {
	profile: Contracts.IProfile;
	wallet: Contracts.IReadWriteWallet;
	currencyDelta?: number;
	isUpdatingTransactions?: boolean;
	noBorder?: boolean;
	onUpdate?: (status: boolean) => void;
}

export interface WalletAddressProperties {
	profile: Contracts.IProfile;
	wallet: Contracts.IReadWriteWallet;
}

export interface WalletBalanceProperties {
	profile: Contracts.IProfile;
	wallet: Contracts.IReadWriteWallet;
	currencyDelta?: number;
}

export interface WalletActionsProperties {
	profile: Contracts.IProfile;
	wallet: Contracts.IReadWriteWallet;
	isUpdatingTransactions?: boolean;
	onUpdate?: (status: boolean) => void;
}
