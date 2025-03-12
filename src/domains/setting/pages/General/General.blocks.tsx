import React from "react";
import { useTranslation } from "react-i18next";

import { ButtonGroup, ButtonGroupOption } from "@/app/components/ButtonGroup";
import { Icon } from "@/app/components/Icon";
import { ViewingModeType } from "@/app/hooks";
import cn from "classnames";

interface ViewingModeItem {
	icon: string;
	name: string;
	value: string;
}

export const SettingsGroup = ({
	className,
	title,
	children,
	...properties
}: React.HTMLAttributes<HTMLDivElement> & {
	title?: string;
}) => (
	<div className={cn("relative flex flex-col", className)} {...properties}>
		{title && <SettingsGroupHeader>{title}</SettingsGroupHeader>}

		<div className="px-6 pb-6 pt-4">{children}</div>
	</div>
);

export const SettingsButtonGroup = ({
	className,
	children,
	...properties
}: React.HTMLAttributes<HTMLDivElement> & {
	title?: string;
}) => (
	<div className={cn("px-6 pb-6", className)} {...properties}>
		<div className="-mt-6">{children}</div>
	</div>
);

const SettingsGroupHeader = ({ className, ...properties }: React.HTMLAttributes<HTMLHeadingElement>) => (
	<h2
		className={cn(
			"-mt-px mb-0 block border-t border-theme-secondary-300 bg-theme-secondary-100 px-6 py-3 text-base font-semibold text-theme-secondary-700 dark:border-theme-dark-700 dark:bg-theme-dark-700 dark:text-theme-dark-200",
			className,
		)}
		{...properties}
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
