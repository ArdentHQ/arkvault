import { Networks } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import { BigNumber } from "@/app/lib/helpers";

enum InputFeeViewType {
	Simple,
	Advanced,
}

enum InputFeeOption {
	Slow = "slow",
	Average = "average",
	Fast = "fast",
}

const DEFAULT_FEE_OPTION = InputFeeOption.Average;
const DEFAULT_VIEW_TYPE = InputFeeViewType.Simple;

type InputFeeOptions = {
	[key in InputFeeOption]: {
		gasPrice: BigNumber;
		label: string;
		displayValue: number;
		displayValueConverted: number;
	};
};

type OnGasPriceChange = (value: BigNumber | string | number) => void;
type OnGasLimitChange = (value: BigNumber | string | number) => void;

interface InputFeeAdvancedProperties {
	convert: (value?: number) => number;
	disabled?: boolean;
	exchangeTicker: string;
	onChangeGasPrice: OnGasPriceChange;
	onChangeGasLimit: OnGasLimitChange;
	showConvertedValue: boolean;
	network: Networks.Network;
	gasPrice: BigNumber;
	gasLimit: BigNumber;
	blockTime?: number;
}

interface InputFeeSimpleProperties {
	options: InputFeeOptions;
	onChange: (value: InputFeeOption) => void;
	selectedOption: InputFeeOption;
	ticker: string;
	exchangeTicker: string;
	showConvertedValues: boolean;
	loading?: boolean;
	blockTime?: number;
}

interface InputFeeProperties {
	min: BigNumber;
	avg: BigNumber;
	max: BigNumber;
	disabled?: boolean;
	network: Networks.Network;
	profile: Contracts.IProfile;
	loading?: boolean;
	viewType?: InputFeeViewType;
	selectedFeeOption?: InputFeeOption;
	gasPrice: BigNumber;
	gasLimit: BigNumber;
	estimatedGasLimit: BigNumber;
	onChangeGasPrice: OnGasPriceChange;
	onChangeGasLimit: OnGasLimitChange;
	onChangeViewType?: (value: InputFeeViewType) => void;
	onChangeFeeOption?: (value: InputFeeOption) => void;
}

export { DEFAULT_FEE_OPTION, DEFAULT_VIEW_TYPE, InputFeeOption, InputFeeViewType };

export type { InputFeeAdvancedProperties, InputFeeProperties, InputFeeOptions, InputFeeSimpleProperties };
