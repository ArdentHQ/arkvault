import { Contracts } from "@ardenthq/sdk-profiles";

export interface BalanceProperties {
	wallet: Contracts.IReadWriteWallet;
	isSynced: boolean;
	className?: string;
	isLargeScreen?: boolean;
}

interface MobileItemProperties {
	onClick?: () => void;
	onButtonClick?: (event?: React.MouseEvent<HTMLElement, MouseEvent> | undefined) => void;
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
export interface RecipientItemMobileProperties {
	onClick?: () => void;
	onButtonClick?: (event?: React.MouseEvent<HTMLElement, MouseEvent> | undefined) => void;
	buttonLabel?: React.ReactNode;
	selected?: boolean;
	type: string;
	address: React.ReactNode;
	name: string;
}
