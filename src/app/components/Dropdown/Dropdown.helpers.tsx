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
		className["dark:text-theme-secondary-600"] = true;
	} else if (typeof iconClassName === "function") {
		className[iconClassName(option)] = true;
	} else {
		className[iconClassName] = true;
	}

	return <Icon name={icon} className={cn(className)} size={iconSize || "md"} />;
};

const isOptionGroup = (options: DropdownOption[] | DropdownOptionGroup[]) =>
	options.length > 0 && options[0].key !== undefined;

const renderOptionGroup = ({ key, hasDivider, title, options, onSelect }: DropdownOptionGroup) => {
	if (options.length === 0 || !onSelect) {
		return;
	}

	return (
		<div key={key}>
			{hasDivider && (
				<div>
					<div className="h-px w-full bg-theme-secondary-300 dark:bg-theme-dark-700" />
				</div>
			)}
			<ul>
				{title && (
					<li className="block whitespace-nowrap px-8 text-left text-xs font-semibold text-theme-secondary-700 dark:text-theme-dark-200 py-1 bg-theme-primary-50 dark:bg-theme-dark-800 rounded-lg mb-1">
						{title}
					</li>
				)}
				{renderOptions({ key, onSelect, options })}
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

export const renderOptions = ({ options, key, onSelect }: OptionsProperties) => {
	const onSelectItem = (event: React.MouseEvent | React.KeyboardEvent, option: DropdownOption) => {
		event.preventDefault();
		event.stopPropagation();
		onSelect(option);
	};

	if (isOptionGroup(options)) {
		return (
			<div>
				{(options as DropdownOptionGroup[]).map((optionGroup: DropdownOptionGroup) =>
					renderOptionGroup({ ...optionGroup, onSelect }),
				)}
			</div>
		);
	}

	return (
		<ul data-testid="dropdown__options">
			{(options as DropdownOption[]).map((option: DropdownOption, index: number) => (
				<DropdownItem
					isActive={!!option.active}
					key={index}
					data-testid={`dropdown__option--${key ? `${key}-` : ""}${index}`}
					onClick={(event) => onSelectItem(event, option)}
					tabIndex={0}
					onKeyDown={(event) => {
						/* istanbul ignore next -- @preserve */
						if (event.key === "Enter" || event.key === " ") {
							onSelectItem(event, option);
						}
					}}
				>
					{option.iconPosition === "start" && renderIcon(option)}
					<span>
						{option.element}
						{option.label}
						{option.secondaryLabel && (
							<span className="ml-1 text-theme-secondary-500 dark:text-theme-secondary-600">
								{renderSecondaryLabel(option.secondaryLabel, !!option.active)}
							</span>
						)}
					</span>
					{option.iconPosition !== "start" && renderIcon(option)}
				</DropdownItem>
			))}
		</ul>
	);
};
