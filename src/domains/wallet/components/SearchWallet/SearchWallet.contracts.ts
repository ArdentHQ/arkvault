import { Networks } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";

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
	onAction: (wallet: SelectedWallet) => void;
	profile: Contracts.IProfile;
}

export interface SearchWalletProperties {
	isOpen: boolean;
	title: string;
	description?: string;
	disableAction?: (wallet: Contracts.IReadWriteWallet) => boolean;
	wallets: Contracts.IReadWriteWallet[];
	searchPlaceholder?: string;
	size?: Size;
	showNetwork?: boolean;
	onClose?: any;
	onSelectWallet: (wallet: SelectedWallet) => void;
	profile: Contracts.IProfile;
	selectedAddress?: string;
}
