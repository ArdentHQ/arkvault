import { Contracts } from "@/app/lib/profiles";
import { Networks } from "@/app/lib/mainsail";
import { Services } from "@/app/lib/mainsail";
import { BigNumber } from "@/app/lib/helpers";

export enum HDWalletTabStep {
	SelectAccountStep = 1,
	EnterImportValueStep = 2,
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
	mnemonic: string;
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
	balance?: BigNumber;
	isImported?: boolean;
	levels: Services.IdentityLevels;
}
