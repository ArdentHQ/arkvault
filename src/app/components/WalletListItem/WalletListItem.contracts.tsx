import { Contracts } from "@payvo/sdk-profiles";
import { useWalletActions } from "@/domains/wallet/hooks/use-wallet-actions";
import { RecipientProperties } from "@/domains/transaction/components/SearchRecipient/SearchRecipient.contracts";

export interface WalletListItemSkeletonProperties {
	isCompact: boolean;
}

export interface WalletListItemProperties {
	wallet: Contracts.IReadWriteWallet;
	isCompact: boolean;
	isLargeScreen?: boolean;
}

export interface StarredProperties {
	wallet: Contracts.IReadWriteWallet;
	handleToggleStar: ReturnType<typeof useWalletActions>["handleToggleStar"];
	isCompact: boolean;
	isLargeScreen?: boolean;
}

export interface WalletCellProperties {
	wallet: Contracts.IReadWriteWallet;
	isCompact: boolean;
}
export interface InfoProperties {
	wallet: Contracts.IReadWriteWallet;
	isCompact: boolean;
	className?: string;
	isLargeScreen?: boolean;
}

export interface BalanceProperties {
	wallet: Contracts.IReadWriteWallet;
	isCompact: boolean;
	isSynced: boolean;
	className?: string;
	isLargeScreen?: boolean;
}

export interface CurrencyProperties {
	wallet: Contracts.IReadWriteWallet;
	isCompact: boolean;
	isSynced: boolean;
	isLargeScreen?: boolean;
}

export interface ButtonsCellProperties {
	wallet: Contracts.IReadWriteWallet;
	isCompact: boolean;
	handleSend: ReturnType<typeof useWalletActions>["handleSend"];
	handleSelectOption: ReturnType<typeof useWalletActions>["handleSelectOption"];
}

export interface MobileLayoutProperties {
	clickHandler?: () => void;
	buttonClickHandler?: (event?: React.MouseEvent<HTMLElement, MouseEvent> | undefined) => void;
	buttonLabel?: React.ReactNode;
	isButtonDisabled?: boolean;
	avatar?: React.ReactNode;
	details?: React.ReactNode;
	balance?: React.ReactNode;
	extraDetails?: React.ReactNode;
}

export interface MobileRecipientProperties {
	clickHandler: () => void;
	recipient: RecipientProperties;
	selected: boolean;
}
