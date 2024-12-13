import { Contracts } from "@ardenthq/sdk-profiles";

export type WalletActionsModalType =
	| "sign-message"
	| "verify-message"
	| "receive-funds"
	| "wallet-name"
	| "delete-wallet"
	| "second-signature"
	| "transaction-history";

export interface WalletActionsProperties {
	wallet: Contracts.IReadWriteWallet;
	activeModal: WalletActionsModalType | undefined;
	setActiveModal: (modal: WalletActionsModalType | undefined) => void;
	onUpdateWallet?: () => void;
}
