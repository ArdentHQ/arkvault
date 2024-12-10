import React, { useMemo } from "react";
import { SideBarItem } from "./SideBarItem";
import { Dropdown, DropdownOption } from "@/app/components/Dropdown";
import { Icon } from "@/app/components/Icon";

export interface Item {
	icon?: string;
	itemKey: string;
	label: string;
	route: string;
}

interface Properties {
	activeItem: string;
	handleActiveItem: (key: string) => void;
	items: Item[];
}

export const SideBar: React.FC<Properties> = ({ activeItem, handleActiveItem, items }: Properties) => {
	const options = useMemo<DropdownOption[]>(
		() =>
			items.map(({ label, itemKey, icon }) => ({
				active: itemKey === activeItem,
				icon: icon,
				iconClassName: (option: DropdownOption) => {
					if (option.active) {
						return "mr-3 text-theme-primary-600";
					}

					return "mr-3 text-theme-primary-300 group-hover:text-theme-primary-600 dark:text-theme-secondary-600 dark:group-hover:text-theme-secondary-200";
				},
				iconPosition: "start",
				iconSize: "lg",
				label: label,
				value: itemKey,
			})),
		[items],
	);

	const selectedLabel = useMemo(
		() => options.find(({ value }) => value === activeItem)?.label,
		[options, activeItem],
	);

	return (
		<>
			<div className="relative -mx-4 lg:hidden">
				<Dropdown
					placement="bottom-start"
					wrapperClass="sm:w-full"
					options={options}
					onSelect={({ value }) => handleActiveItem(String(value))}
					toggleContent={(isOpen) => (
						<div className="mx-4 flex cursor-pointer items-center space-x-4 overflow-hidden rounded-xl border border-theme-primary-100 p-3 dark:border-theme-secondary-800 sm:p-6">
							<Icon size="lg" name={isOpen ? "MenuOpen" : "Menu"} />

							<span className="font-semibold leading-tight">{selectedLabel}</span>
						</div>
					)}
				/>
			</div>

			<div className="hidden h-full w-[210px] lg:block">
				<ul>
					{items.map(({ label, route, itemKey, icon }, index) => (
						<SideBarItem
							label={label}
							route={route}
							icon={icon}
							itemKey={itemKey}
							key={index}
							handleActiveItem={handleActiveItem}
							isActive={activeItem === itemKey}
						/>
					))}
				</ul>
			</div>
		</>
	);
};
