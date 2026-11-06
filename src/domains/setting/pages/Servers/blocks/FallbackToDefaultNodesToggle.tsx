import React from "react";
import { useFormContext } from "react-hook-form";
import { Toggle } from "@/app/components/Toggle";

export const FallbackToDefaultNodesToggle = () => {
	const form = useFormContext<{
		fallbackToDefaultNodes: boolean;
	}>();

	const value = form.watch("fallbackToDefaultNodes");

	return (
		<Toggle
			{...form.register("fallbackToDefaultNodes")}
			defaultChecked={value}
			data-testid="Plugin-settings__servers--fallback-to-default-nodes"
		/>
	);
};
