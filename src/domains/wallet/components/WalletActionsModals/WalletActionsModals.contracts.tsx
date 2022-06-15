import { Contracts } from "@ardenthq/sdk-profiles";

export type WalletActionsModalType =
	| "sign-message"
	| "verify-message"
	| "receive-funds"
	| "wallet-name"
	| "delete-wallet"
	| "unlockable-balances"
	| "second-signature";

export interface WalletActionsProperties {
	wallet: Contracts.IReadWriteWallet;
	activeModal: WalletActionsModalType | undefined;
	setActiveModal: (modal: WalletActionsModalType | undefined) => void;
	onUpdateWallet?: () => void;
}
