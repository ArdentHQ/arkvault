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
			<div className="relative py-2 px-6 -mx-6 -mt-4 border-t md:p-0 md:m-0 md:bg-transparent md:border-t-0 lg:hidden dark:bg-black border-theme-secondary-300 bg-theme-secondary-200 dark:border-theme-dark-700 dark:md:bg-transparent">
				<Dropdown
					placement="bottom-start"
					wrapperClass="sm:w-full px-6 sm:px-6 md:px-10 -mt-2"
					options={options}
					onSelect={({ value }) => handleActiveItem(String(value))}
					toggleContent={(isOpen) => (
						<div className="flex overflow-hidden items-center py-3 px-4 space-x-4 bg-white rounded border border-transparent cursor-pointer dark:border md:border-theme-secondary-300 dark:border-theme-dark-700 dark:bg-theme-dark-900">
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

			<div className="hidden p-1 rounded-xl border lg:block border-theme-secondary-300 w-[200px] dark:border-theme-dark-700">
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
