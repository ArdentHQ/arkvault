import React, { useMemo } from "react";
import { SideBarItem } from "./SideBarItem";
import { DropdownOption } from "@/app/components/SimpleDropdown";
import { Icon } from "@/app/components/Icon";
import classNames from "classnames";
import { DropdownRoot, DropdownToggle, DropdownContent, DropdownListItem } from "@/app/components/SimpleDropdown";

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
			<div className="relative -mx-6 -mt-4 border-t border-theme-secondary-300 bg-theme-secondary-200 px-6 py-2 dim:border-theme-dim-700 dim:bg-theme-dim-950 dark:border-theme-dark-700 dark:bg-black md:m-0 md:border-t-0 md:bg-transparent md:p-0 dim:md:bg-transparent dark:md:bg-transparent lg:hidden">
				<DropdownRoot>
					<DropdownToggle className="w-full">
						{({ isOpen }) => (
							<div className="flex cursor-pointer items-center space-x-4 overflow-hidden rounded border border-transparent bg-white px-4 py-3 text-left dim:border dim:border-theme-dim-700 dim:bg-theme-dim-900 dark:border dark:border-theme-dark-700 dark:bg-theme-dark-900 md:border-theme-secondary-300">
								<span className="flex-1 font-semibold leading-tight">{selectedLabel}</span>

								<Icon
									name="ChevronDownSmall"
									className={classNames("transition-transform", { "rotate-180": isOpen })}
									size="sm"
								/>
							</div>
						)}
					</DropdownToggle>
					<DropdownContent>
						<ul>
							{options.map((option, index) => (
								<DropdownListItem
									key={option.value}
									data-testid={`Sidebar--option-${index}`}
									className={classNames({
										"bg-theme-secondary-200 text-theme-primary-600 dim:bg-theme-dim-950 dim:text-theme-dim-50 dark:bg-theme-dark-950 dark:text-theme-dark-50":
											option.active,
									})}
									onClick={() => handleActiveItem(String(option.value))}
								>
									{option.label}
								</DropdownListItem>
							))}
						</ul>
					</DropdownContent>
				</DropdownRoot>
			</div>

			<div className="hidden w-[200px] rounded-xl border border-theme-secondary-300 p-1 dim:border-theme-dim-700 dark:border-theme-dark-700 lg:block">
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
