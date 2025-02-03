import React from "react";
import { twMerge } from "tailwind-merge";
import { useTranslation } from "react-i18next";

import { ButtonGroup, ButtonGroupOption } from "@/app/components/ButtonGroup";
import { Icon } from "@/app/components/Icon";
import { ViewingModeType } from "@/app/hooks";

interface ViewingModeItem {
	icon: string;
	name: string;
	value: string;
}

export const SettingsGroup = ({ ...props }: React.HTMLProps<HTMLDivElement>) => (
	<div
		{...props}
		className={twMerge(
			"relative -mx-8 mt-8 border-t border-theme-secondary-300 px-8 pt-6 dark:border-theme-secondary-800 sm:border-0 sm:pt-0",
			props.className,
		)}
	/>
);

export const ViewingMode = ({
	viewingMode,
	onChange,
}: {
	viewingMode: ViewingModeType;
	onChange?: (mode: ViewingModeType) => void;
}) => {
	const { t } = useTranslation();

	const viewingModes: ViewingModeItem[] = [
		{
			icon: "UnderlineSun",
			name: t("SETTINGS.APPEARANCE.OPTIONS.VIEWING_MODE.VIEWING_MODES.LIGHT"),
			value: "light",
		},
		{
			icon: "UnderlineMoon",
			name: t("SETTINGS.APPEARANCE.OPTIONS.VIEWING_MODE.VIEWING_MODES.DARK"),
			value: "dark",
		},
	];

	return (
		<ButtonGroup className="space-x-3">
			{viewingModes.map(({ icon, name, value }) => (
				<ButtonGroupOption
					key={value}
					isSelected={() => viewingMode === value}
					setSelectedValue={() => onChange?.(value as ViewingModeType)}
					value={value}
					variant="modern"
				>
					<div className="flex items-center px-2">
						<Icon size="lg" name={icon} />
						<span className="ml-2 hidden sm:inline">{name}</span>
					</div>
				</ButtonGroupOption>
			))}
		</ButtonGroup>
	);
};
