import React from "react";
import { Toggle } from "@/app/components/Toggle";

interface Properties {
	name: string;
	isChecked?: boolean;
	onChange?: (isChecked: boolean) => void;
}

export const AppearanceToggle = ({ name, isChecked, onChange }: Properties) => (
	<Toggle
		name={name}
		defaultChecked={!!isChecked}
		data-testid={`AppearanceToggle__toggle-${name}`}
		onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
			onChange?.(event.target.checked)
		}
	/>
);
