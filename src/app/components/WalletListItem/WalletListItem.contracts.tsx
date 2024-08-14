import { Contracts } from "@ardenthq/sdk-profiles";
import { useWalletActions } from "@/domains/wallet/hooks/use-wallet-actions";

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
	onToggleStar: ReturnType<typeof useWalletActions>["handleToggleStar"];
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
	onSend: ReturnType<typeof useWalletActions>["handleSend"];
	onSelectOption: ReturnType<typeof useWalletActions>["handleSelectOption"];
}

interface MobileItemProperties {
	onClick?: () => void;
	onButtonClick?: (event?: React.MouseEvent<HTMLElement, MouseEvent> | undefined) => void;
	buttonLabel?: React.ReactNode;
	selected?: boolean;
}

export interface WalletListItemMobileProperties extends MobileItemProperties {
	isButtonDisabled?: boolean;
	avatar?: React.ReactNode;
	details?: React.ReactNode;
	balance?: React.ReactNode;
	extraDetails?: React.ReactNode;
}
export interface RecipientItemMobileProperties extends MobileItemProperties {
	type: string;
	address: React.ReactNode;
	name: string;
}

export interface ReceiverItemMobileProperties extends MobileItemProperties {
	address: React.ReactNode;
	name: string;
	balance: React.ReactNode;
}
export interface RecipientItemMobileProperties {
	onClick?: () => void;
	onButtonClick?: (event?: React.MouseEvent<HTMLElement, MouseEvent> | undefined) => void;
	buttonLabel?: React.ReactNode;
	selected?: boolean;
	type: string;
	address: React.ReactNode;
	name: string;
}
