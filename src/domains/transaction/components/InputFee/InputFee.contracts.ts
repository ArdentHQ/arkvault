import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";

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
		label: string;
		displayValue: number;
		displayValueConverted: number;
	};
};

interface InputFeeAdvancedProperties {
	convert: (value?: number) => number;
	disabled?: boolean;
	exchangeTicker: string;
	onChangeGasPrice: (value: string) => void;
	onChangeGasLimit: (value: number) => void;
	showConvertedValue: boolean;
	step: number;
	network: Networks.Network;
	gasPrice: string;
	gasLimit: number;
}

interface InputFeeSimpleProperties {
	options: InputFeeOptions;
	onChange: (value: InputFeeOption) => void;
	selectedOption: InputFeeOption;
	ticker: string;
	exchangeTicker: string;
	showConvertedValues: boolean;
	loading?: boolean;
}

interface InputFeeProperties {
	min: number;
	avg: number;
	max: number;
	step: number;
	disabled?: boolean;
	network: Networks.Network;
	profile: Contracts.IProfile;
	loading?: boolean;
	viewType?: InputFeeViewType;
	selectedFeeOption?: InputFeeOption;
	gasPrice: string;
	gasLimit: number;
	onChangeGasPrice: (value: string) => void;
	onChangeGasLimit: (value: number) => void;
	onChangeViewType?: (value: InputFeeViewType) => void;
	onChangeFeeOption?: (value: InputFeeOption) => void;
}

export { DEFAULT_FEE_OPTION, DEFAULT_VIEW_TYPE, InputFeeOption, InputFeeViewType };

export type { InputFeeAdvancedProperties, InputFeeProperties, InputFeeOptions, InputFeeSimpleProperties };
