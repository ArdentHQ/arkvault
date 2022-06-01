import React from "react";

import { SelectCategoryProperties } from "./SelectCategory.contracts";
import { Input, CustomButton } from "./SelectCategory.styles";

export const SelectCategory = React.forwardRef<HTMLInputElement, SelectCategoryProperties>(
	(
		{
			children,
			type = "checkbox",
			name,
			value,
			checked,
			defaultChecked,
			disabled,
			onChange,
			...properties
		}: SelectCategoryProperties,
		reference,
	) => (
		<label htmlFor={name} className="cursor-pointer" {...properties}>
			<Input
				data-testid={name ? `SelectCategory__${name}` : undefined}
				ref={reference}
				type={type}
				name={name}
				value={value}
				checked={checked}
				defaultChecked={defaultChecked}
				disabled={disabled}
				onChange={onChange}
			/>
			<CustomButton>{children}</CustomButton>
		</label>
	),
);

SelectCategory.displayName = "SelectCategory";
