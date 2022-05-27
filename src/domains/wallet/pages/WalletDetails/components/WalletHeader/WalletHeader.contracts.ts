import { Contracts } from "@payvo/sdk-profiles";
import { WalletActionsModalType } from "@/domains/wallet/components/WalletActionsModals/WalletActionsModals.contracts";

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
	setActiveModal: (modal: WalletActionsModalType | undefined) => void;
}
