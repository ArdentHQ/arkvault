import { OptionGroupProperties, OptionProperties } from "./SelectDropdown.contracts";

export const isOptionGroup = (options: OptionProperties | OptionGroupProperties): boolean =>
	(options as OptionGroupProperties)?.title !== undefined;

export const isMatch = (inputValue: string, option: OptionProperties): boolean =>
	!!inputValue && option.label.toLowerCase().startsWith(inputValue.toLowerCase());

export const getMainOptions = (options: OptionProperties[] | OptionGroupProperties[]): OptionProperties[] => {
	if (isOptionGroup(options[0])) {
		return (options as OptionGroupProperties[]).flatMap((optionGroup) => optionGroup.options);
	}

	return options as OptionProperties[];
};

export const matchOptions = (
	options: OptionProperties[] | OptionGroupProperties[],
	inputValue: string,
): OptionProperties[] | OptionGroupProperties[] => {
	if (!isOptionGroup(options[0])) {
		return (options as OptionProperties[]).filter((option: OptionProperties) => isMatch(inputValue, option));
	}

	const allOptions: OptionGroupProperties[] = [];

	for (const optionGroup of options as OptionGroupProperties[]) {
		const matchOptions = optionGroup.options.filter((option: OptionProperties) => isMatch(inputValue, option));

		if (matchOptions.length > 0) {
			allOptions.push({ options: matchOptions, title: optionGroup.title });
		}
	}

	return allOptions;
};
