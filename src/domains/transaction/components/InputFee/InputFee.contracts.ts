import { Networks } from "@payvo/sdk";
import { Contracts } from "@payvo/sdk-profiles";

enum InputFeeViewType {
	Simple,
	Advanced,
}

enum InputFeeSimpleValue {
	Slow = "slow",
	Average = "average",
	Fast = "fast",
}

const DEFAULT_SIMPLE_VALUE = InputFeeSimpleValue.Average;
const DEFAULT_VIEW_TYPE = InputFeeViewType.Simple;

type InputFeeSimpleOptions = {
	[key in InputFeeSimpleValue]: {
		label: string;
		displayValue: number;
		displayValueConverted: number;
	};
};

interface InputFeeAdvancedProperties {
	convert: (value?: number) => number;
	disabled?: boolean;
	exchangeTicker: string;
	onChange: (value: string) => void;
	showConvertedValue: boolean;
	step: number;
	value: string;
}

interface InputFeeSimpleProperties {
	options: InputFeeSimpleOptions;
	onChange: (value: InputFeeSimpleValue) => void;
	value: InputFeeSimpleValue;
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
	simpleValue?: InputFeeSimpleValue;
	value: string | undefined;
	onChange: (value: string) => void;
	onChangeViewType?: (value: InputFeeViewType) => void;
	onChangeSimpleValue?: (value: InputFeeSimpleValue) => void;
}

export { DEFAULT_SIMPLE_VALUE, DEFAULT_VIEW_TYPE, InputFeeSimpleValue, InputFeeViewType };

export type { InputFeeAdvancedProperties, InputFeeProperties, InputFeeSimpleOptions, InputFeeSimpleProperties };
