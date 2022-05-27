import cn from "classnames";
import React, { memo } from "react";

import { SelectDropdownItemProperties } from "./SelectDropdown.contracts";

export const SelectDropdownItem = memo(
	({
		item,
		index,
		getItemProps,
		highlightedIndex,
		inputValue,
		onMouseDown,
		renderLabel,
	}: SelectDropdownItemProperties) => (
		<li
			key={`${item.value}-${index}`}
			data-testid={`SelectDropdown__option--${index}`}
			{...getItemProps({
				className: cn(
					"select-list-option",
					{ "is-highlighted": highlightedIndex === index },
					{ "is-selected": item.label === inputValue },
				),
				index,
				item,
				onMouseDown: () => onMouseDown(item),
			})}
		>
			<div className="select-list-option__label">
				{renderLabel ? renderLabel({ ...item, isSelected: item.label === inputValue }) : item.label}
			</div>
		</li>
	),
);

SelectDropdownItem.displayName = "SelectDropdownItem";
