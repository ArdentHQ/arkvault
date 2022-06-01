import React from "react";
import { useTranslation } from "react-i18next";

import {
	OptionGroupProperties,
	OptionProperties,
	SelectDropdownRenderOptionsProperties,
} from "./SelectDropdown.contracts";
import { isOptionGroup } from "./SelectDropdown.helpers";
import { SelectDropdownItem } from "./SelectDropdownItem";

export const SelectDropdownRenderOptions = ({
	data,
	getItemProps,
	highlightedIndex,
	inputValue,
	onMouseDown,
	renderLabel,
}: SelectDropdownRenderOptionsProperties) => {
	const { t } = useTranslation();

	if (data.length === 0) {
		return <li className="select-list-option is-empty">{t("COMMON.NO_OPTIONS")}</li>;
	}

	if (!isOptionGroup(data[0])) {
		return (
			<>
				{(data as OptionProperties[]).map((item: OptionProperties, index: number) => (
					<SelectDropdownItem
						key={`${item.value}-${index}`}
						index={index}
						item={item}
						getItemProps={getItemProps}
						renderLabel={renderLabel}
						inputValue={inputValue}
						onMouseDown={onMouseDown}
						highlightedIndex={highlightedIndex}
					/>
				))}
			</>
		);
	}

	/*
	 * by unique index, downshift keeps track of items when updating the highlightedIndex as the user keys around.
	 * https://github.com/downshift-js/downshift/tree/master/src/hooks/useCombobox#getitemprops
	 */
	let index = 0;
	return (
		<>
			{(data as OptionGroupProperties[]).flatMap((optionGroup, groupIndex) => {
				const options = optionGroup.options.map((item: OptionProperties) => {
					const itemIndex = index++;
					return (
						<SelectDropdownItem
							key={`${item.value}-${itemIndex}`}
							index={itemIndex}
							item={item}
							getItemProps={getItemProps}
							renderLabel={renderLabel}
							inputValue={inputValue}
							onMouseDown={onMouseDown}
							highlightedIndex={highlightedIndex}
						/>
					);
				});

				const optionsHead = (
					<li key={optionGroup.title} className="select-list-option-head">
						<div className="select-list-option-head__label">{optionGroup.title}</div>
					</li>
				);

				return (
					<ul
						key={optionGroup.title}
						className="select-list-option-group"
						data-testid={`SelectDropdown__option-group--${groupIndex}`}
					>
						{optionsHead}
						{options}
					</ul>
				);
			})}
		</>
	);
};
