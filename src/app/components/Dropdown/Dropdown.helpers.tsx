import cn from "classnames";
import React from "react";
import { DropdownOption, DropdownOptionGroup, OptionsProperties } from "./Dropdown.contracts";
import { Icon } from "@/app/components/Icon";
import { DropdownItem } from "@/app/components/Dropdown/DropdownItem";

const renderIcon = (option: DropdownOption) => {
	const { icon, iconClassName, iconSize } = option;

	if (!icon) {
		return;
	}

	const className = {};

	if (!iconClassName) {
		className["dark:text-theme-secondary-600 dim:text-theme-dim-200"] = true;
	} else if (typeof iconClassName === "function") {
		className[iconClassName(option)] = true;
	} else {
		className[iconClassName] = true;
	}

	return <Icon name={icon} className={cn(className)} size={iconSize || "md"} />;
};

const isOptionGroup = (options: DropdownOption[] | DropdownOptionGroup[]) =>
	options.length > 0 && options[0].key !== undefined;

const renderOptionGroup = ({
	key,
	hasDivider,
	title,
	options,
	onSelect,
	variant,
}: DropdownOptionGroup & { variant?: string }) => {
	if (options.length === 0 || !onSelect) {
		return;
	}

	return (
		<div key={key}>
			{hasDivider && (
				<div>
					<div className="bg-theme-secondary-300 dark:bg-theme-dark-700 dim:bg-theme-dim-700 h-px w-full" />
				</div>
			)}
			<ul>
				{title && (
					<li className="bg-theme-primary-50 text-theme-secondary-700 dark:bg-theme-dark-800 dark:text-theme-dark-200 dim:bg-theme-dim-navy-900 dim:text-theme-dim-200 mx-1 my-1 block rounded-lg px-5 py-1 text-left text-xs font-semibold whitespace-nowrap">
						{title}
					</li>
				)}
				{renderOptions({ key, onSelect, options, variant })}
			</ul>
		</div>
	);
};

const renderSecondaryLabel = (value: string | Function, isActive: boolean) => {
	if (typeof value === "function") {
		return value(isActive);
	}

	return value;
};

export const renderOptions = ({ options, key, onSelect, variant }: OptionsProperties) => {
	const onSelectItem = (event: React.MouseEvent | React.KeyboardEvent, option: DropdownOption) => {
		event.preventDefault();
		event.stopPropagation();
		onSelect(option);
	};

	if (isOptionGroup(options)) {
		return (
			<div>
				{(options as DropdownOptionGroup[]).map((optionGroup: DropdownOptionGroup) =>
					renderOptionGroup({ ...optionGroup, onSelect, variant }),
				)}
			</div>
		);
	}

	return (
		<ul data-testid="dropdown__options">
			{(options as DropdownOption[]).map((option: DropdownOption, index: number) => (
				<DropdownItem
					variant={variant}
					isActive={!!option.active}
					key={index}
					data-testid={`dropdown__option--${key ? key + "-" : ""}${index}`}
					onClick={(event) => onSelectItem(event, option)}
					tabIndex={option.disableFocus ? -1 : 0}
					onKeyDown={(event) => {
						/* istanbul ignore next -- @preserve */
						if (event.key === "Enter" || event.key === " ") {
							onSelectItem(event, option);
						}
					}}
				>
					{option.iconPosition === "start" && renderIcon(option)}
					<span className="flex w-full items-center justify-between">
						{option.element}
						<span>{option.label}</span>
						{option.secondaryLabel && (
							<span className="text-theme-secondary-500 dark:text-theme-secondary-600 ml-1 pr-4">
								{renderSecondaryLabel(option.secondaryLabel, !!option.active)}
							</span>
						)}
					</span>
					{option.iconPosition !== "start" && renderIcon(option)}
					<div className="h-4 w-4">
						{option.active && variant === "options" && (
							<Icon
								name={"CheckmarkDouble"}
								size="md"
								className="text-theme-primary-600 dark:text-theme-secondary-200"
							/>
						)}
					</div>
				</DropdownItem>
			))}
		</ul>
	);
};
