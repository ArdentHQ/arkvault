import React, { useMemo } from "react";
import { SideBarItem } from "./SideBarItem";
import { Dropdown, DropdownOption } from "@/app/components/Dropdown";
import { Icon } from "@/app/components/Icon";
import classNames from "classnames";

export interface Item {
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
			items.map(({ label, itemKey }) => ({
				active: itemKey === activeItem,
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
			<div className="relative -mx-6 -mt-4 bg-theme-secondary-200 px-6 py-2 dark:bg-theme-dark-950 md:m-0 md:bg-transparent md:p-0 dark:md:bg-transparent lg:hidden">
				<Dropdown
					placement="bottom-start"
					wrapperClass="sm:w-full px-6 sm:px-6 md:px-10 -mt-2"
					options={options}
					onSelect={({ value }) => handleActiveItem(String(value))}
					toggleContent={(isOpen) => (
						<div className="flex cursor-pointer items-center space-x-4 overflow-hidden rounded border border-transparent bg-white px-4 py-3 dark:border dark:border-theme-dark-700 dark:bg-transparent md:border-theme-secondary-300">
							<span className="flex-1 font-semibold leading-tight">{selectedLabel}</span>

							<Icon
								name="ChevronDownSmall"
								className={classNames("transition-transform", { "rotate-180": isOpen })}
								size="sm"
							/>
						</div>
					)}
				/>
			</div>

			<div className="hidden w-[200px] rounded-xl border border-theme-secondary-300 p-1 dark:border-theme-dark-700 lg:block">
				<ul className="space-y-1">
					{items.map(({ label, route, itemKey }, index) => (
						<SideBarItem
							label={label}
							route={route}
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
