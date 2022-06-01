import React from "react";
import { useFormContext } from "react-hook-form";

import { Toggle } from "@/app/components/Toggle";
import { AppearanceSettingsState } from "@/domains/setting/pages/Appearance/Appearance.contracts";

interface AppearanceToggleProperties {
	name: string;
}

export const AppearanceToggle: React.FC<AppearanceToggleProperties> = ({ name }) => {
	const form = useFormContext<AppearanceSettingsState>();

	const value = form.watch(name);

	return (
		<Toggle
			ref={form.register()}
			name={name}
			defaultChecked={!!value}
			data-testid={`AppearanceToggle__toggle-${name}`}
		/>
	);
};
