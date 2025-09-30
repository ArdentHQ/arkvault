import { Contracts } from "@/app/lib/profiles";
import { Networks } from "@/app/lib/mainsail";
import { Services } from "@/app/lib/mainsail";

export enum HDWalletTabStep {
	SelectAccountStep = 1,
	EnterMnemonicStep,
	EncryptPasswordStep,
	SelectAddressStep,
	SummaryStep,
}

export interface HDWalletTabsProperties {
	onBack?: () => void;
	onSubmit?: () => void;
	onCancel?: () => void;
	onStepChange?: (step: HDWalletTabStep) => void;
	activeIndex?: HDWalletTabStep;
	onClickEditWalletName: (wallet: Contracts.IReadWriteWallet) => void;
	addressesPerPage?: number;
	mnemonic: string
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
	addressesPerPage?: number;
}

export interface AddressData {
	address: string;
	path: string;
	balance?: number;
	isNew?: boolean;
	levels: Services.IdentityLevels;
}
