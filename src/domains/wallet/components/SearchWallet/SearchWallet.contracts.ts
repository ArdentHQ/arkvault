import { Networks } from "@payvo/sdk";
import { Contracts } from "@payvo/sdk-profiles";

import { Size } from "@/types";

export interface SelectedWallet {
	address: string;
	network: Networks.Network;
	name?: string;
}
export interface SearchWalletListItemProperties {
	index: number;
	disabled?: boolean;
	exchangeCurrency: string;
	showConvertedValue?: boolean;
	showNetwork?: boolean;
	selectedAddress?: string;
	alias?: string;
	wallet: Contracts.IReadWriteWallet;
	isCompact: boolean;
	onAction: (wallet: SelectedWallet) => void;
}
export interface SearchWalletListItemResponsiveProperties {
	selectedAddress?: string;
	wallet: Contracts.IReadWriteWallet;
	alias?: string;
	showNetwork?: boolean;
	onAction: (wallet: SelectedWallet) => void;
}

export interface SearchWalletProperties {
	isOpen: boolean;
	title: string;
	description?: string;
	disableAction?: (wallet: Contracts.IReadWriteWallet) => boolean;
	wallets: Contracts.IReadWriteWallet[];
	searchPlaceholder?: string;
	size?: Size;
	showConvertedValue?: boolean;
	showNetwork?: boolean;
	onClose?: any;
	onSelectWallet: (wallet: SelectedWallet) => void;
	profile: Contracts.IProfile;
	selectedAddress?: string;
}
