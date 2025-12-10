import { Contracts } from "@/app/lib/profiles";

export type WalletActionsModalType =
	| "sign-message"
	| "verify-message"
	| "receive-funds"
	| "wallet-name"
	| "delete-wallet"
	| "second-signature"
	| "transaction-history"
	| "hd-account-name";

export interface WalletActionsProperties {
	wallets: Contracts.IReadWriteWallet[];
	activeModal: WalletActionsModalType | undefined;
	setActiveModal: (modal: WalletActionsModalType | undefined) => void;
	onUpdateWallet?: () => void;
}
