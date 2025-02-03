import React from "react";
import { useTranslation } from "react-i18next";

import { ButtonGroup, ButtonGroupOption } from "@/app/components/ButtonGroup";
import { Icon } from "@/app/components/Icon";
import { ViewingModeType } from "@/app/hooks";

interface ViewingModeItem {
	icon: string;
	name: string;
	value: string;
}

export const AppearanceViewingMode = ({ viewingMode, onChange }: { viewingMode: ViewingModeType, onChange?: (mode: ViewingModeType) => void }) => {
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
			))
			}
		</ButtonGroup >
	);
};
