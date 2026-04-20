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
					{ "is-disabled": item.isDisabled },
				),
				disabled: item.isDisabled,
				index,
				item,
				onMouseDown: item.isDisabled ? undefined : () => onMouseDown(item),
			})}
		>
			<div className="select-list-option__label">
				{renderLabel
					? renderLabel({
							...item,
							isHighlighted: highlightedIndex === index,
							isSelected: item.label === inputValue,
						})
					: item.label}
			</div>
		</li>
	),
);

SelectDropdownItem.displayName = "SelectDropdownItem";
