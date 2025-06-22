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
	description,
	children,
	...properties
}: React.HTMLAttributes<HTMLDivElement> & {
	title?: string;
	description?: string;
}) => (
	<div className={cn("relative flex flex-col", className)} {...properties}>
		{title && <SettingsGroupHeader description={description}>{title}</SettingsGroupHeader>}

		<div className="pt-4 pb-6 sm:px-6">{children}</div>
	</div>
);

export const SettingsButtonGroup = ({
	className,
	children,
	...properties
}: React.HTMLAttributes<HTMLDivElement> & {
	title?: string;
}) => (
	<div
		className={cn("border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 sm:border-t sm:p-6", className)}
		{...properties}
	>
		<div className="sm:-mt-6">{children}</div>
	</div>
);

const SettingsGroupHeader = ({
	className,
	children,
	description,
	...properties
}: React.HTMLAttributes<HTMLHeadingElement> & {
	description?: string;
}) => (
	<div
		className={cn(
			"border-theme-primary-400 bg-theme-secondary-100 dark:border-theme-dark-700 dark:bg-theme-dark-700 sm:border-theme-secondary-300 -mx-3 block border-l-2 px-2.5 py-3 sm:mx-0 sm:-mt-px sm:border-t sm:border-l-0 sm:px-6 dim:border-theme-dim-700 dim:bg-theme-dim-950",
			className,
		)}
		{...properties}
	>
		<h2 className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 mb-0 text-base font-semibold">
			{children}
		</h2>

		{description && (
			<p className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 mt-1 text-sm">
				{description}
			</p>
		)}
	</div>
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
		{
			icon: "Dim",
			name: t("SETTINGS.APPEARANCE.OPTIONS.VIEWING_MODE.VIEWING_MODES.DIM"),
			value: "dim",
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
					className="h-11 rounded"
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
