import { Contracts } from "@/app/lib/profiles";
import { Networks } from "@/app/lib/mainsail";

export enum HDWalletTabStep {
	SelectWalletStep = 1,
	EnterMnemonicStep,
	EncryptPasswordStep,
	SelectAddressStep,
	ViewImportStep,
}

export interface HDWalletTabsProperties {
	onBack?: () => void;
	onSubmit?: () => void;
	onCancel?: () => void;
	onStepChange?: (step: HDWalletTabStep) => void;
	activeIndex?: HDWalletTabStep;
	onClickEditWalletName: (wallet: Contracts.IReadWriteWallet) => void;
}

export interface AddressTableProperties {
	network: Networks.Network;
	wallets: AddressData[];
	selectedWallets: AddressData[];
	toggleSelect: (address: AddressData) => void;
	toggleSelectAll: () => void;
	isLoading: boolean;
	isSelected: (address: AddressData) => boolean;
	loadMore: () => void;
}

export interface AddressData {
	address: string;
	path: string;
	balance?: number;
	isNew?: boolean;
}
