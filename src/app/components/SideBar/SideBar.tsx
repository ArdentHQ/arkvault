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
			<div className="border-theme-secondary-300 bg-theme-secondary-200 dark:border-theme-dark-700 dim:border-theme-dim-700 relative -mx-6 -mt-4 border-t px-6 py-2 md:m-0 md:border-t-0 md:bg-transparent md:p-0 lg:hidden dark:bg-black dark:md:bg-transparent dim:bg-theme-dim-950 dim:md:bg-transparent">
				<Dropdown
					placement="bottom-start"
					wrapperClass="sm:w-full px-6 sm:px-6 md:px-10 -mt-2"
					options={options}
					onSelect={({ value }) => handleActiveItem(String(value))}
					toggleContent={(isOpen) => (
						<div className="md:border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 dark:bg-theme-dark-900 dim:bg-theme-dim-900 dim:border flex cursor-pointer items-center space-x-4 overflow-hidden rounded border border-transparent bg-white px-4 py-3 dark:border">
							<span className="flex-1 leading-tight font-semibold">{selectedLabel}</span>

							<Icon
								name="ChevronDownSmall"
								className={classNames("transition-transform", { "rotate-180": isOpen })}
								size="sm"
							/>
						</div>
					)}
				/>
			</div>

			<div className="border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 hidden w-[200px] rounded-xl border p-1 lg:block">
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
