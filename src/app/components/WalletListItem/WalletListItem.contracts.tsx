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
