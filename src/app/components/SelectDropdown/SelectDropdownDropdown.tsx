import React, { useMemo } from "react";
import Tippy from "@tippyjs/react";

import { SelectDropdownDropdownProperties } from "./SelectDropdown.contracts";
import { SelectDropdownRenderOptions as RenderOptions } from "./SelectDropdownRenderOptions";

const SelectOptionsList = ({...props}: React.HTMLAttributes<HTMLUListElement>) => (
	<ul
		{...props}
		className="select-options-list"
	/>
)

export const SelectDropdownDropdown = ({
	reference,
	data,
	getItemProps,
	highlightedIndex,
	inputValue,
	onMouseDown,
	renderLabel,
	allowOverflow,
}: SelectDropdownDropdownProperties) => {
	const renderDropdownContent = (attributes) => (
		<div {...attributes}>
			{
				<SelectOptionsList>
					<RenderOptions
						data={data}
						getItemProps={getItemProps}
						highlightedIndex={highlightedIndex}
						inputValue={inputValue}
						onMouseDown={onMouseDown}
						renderLabel={renderLabel}
					/>
				</SelectOptionsList>
			}
		</div>
	);

	const modifiers: any = useMemo(() => {
		const modifiers = [
			{
				enabled: true,
				fn: (options): void => {
					options.state.styles.popper.minWidth = "100%";
				},
				name: "minWidth",
				phase: "beforeWrite",
			},
		];

		if (!allowOverflow) {
			modifiers.push({
				enabled: true,
				fn: (options): void => {
					options.state.styles.popper.maxWidth = "100%";
				},
				name: "maxWidth",
				phase: "beforeWrite",
			});
		}

		return modifiers;
	}, [allowOverflow]);

	return (
		<Tippy
			visible={true}
			appendTo={(element) => element.nextElementSibling!}
			interactive
			offset={[0, 5]}
			reference={reference}
			placement="bottom-start"
			render={renderDropdownContent}
			popperOptions={{ modifiers }}
		/>
	);
};
