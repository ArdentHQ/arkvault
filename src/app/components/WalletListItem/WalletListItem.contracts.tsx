import { Contracts } from "@/app/lib/profiles";

export interface BalanceProperties {
	wallet: Contracts.IReadWriteWallet;
	isSynced: boolean;
	className?: string;
	isLargeScreen?: boolean;
}

interface MobileItemProperties {
	onClick?: () => void;
	onButtonClick?: (event?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
	buttonLabel?: React.ReactNode;
	selected?: boolean;
}

export interface RecipientItemProperties extends MobileItemProperties {
	type: string;
	address: string;
	name: string;
	index: number;
}

export interface RecipientItemMobileProperties extends MobileItemProperties {
	type: string;
	address: string;
	name: string;
}

export interface ReceiverItemMobileProperties extends MobileItemProperties {
	wallet: Contracts.IReadWriteWallet;
	name: string;
	disabled?: boolean;
}

export interface ReceiverItemProperties extends MobileItemProperties {
	wallet: Contracts.IReadWriteWallet;
	name: string;
	exchangeCurrency: string;
	disabled?: boolean;
	index: number;
}
