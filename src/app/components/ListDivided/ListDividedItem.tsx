import React from "react";
import cn from "classnames";
import { ListDividedItemProperties } from "./ListDivided.contracts";

export const ListDividedItem: React.VFC<ListDividedItemProperties> = ({
	isFloatingLabel,
	label,
	labelWrapperClass,
	labelClass,
	labelDescription,
	labelDescriptionClass,
	labelAddon,
	value,
	itemValueClass,
	content,
	contentClass,
	wrapperClass,
}) => (
	<li className={cn("flex w-full flex-col", wrapperClass)} data-testid="list-divided-item__wrapper">
		{label && (
			<div
				className={cn({
					"flex justify-between": !labelWrapperClass,
					"flex-col items-start": isFloatingLabel && !labelWrapperClass,
					"items-center": !isFloatingLabel && !labelWrapperClass,
					[labelWrapperClass || ""]: !!labelWrapperClass,
				})}
				data-testid="list-divided-item__inner-wrapper"
			>
				<div className="flex w-full flex-col space-y-2">
					<div className="flex items-center justify-between space-x-5">
						<span
							className={
								labelClass || "font-semibold text-theme-secondary-700 dark:text-theme-secondary-200"
							}
							data-testid="list-divided-item__label"
						>
							{label}
						</span>
						{labelAddon && <span>{labelAddon}</span>}
					</div>
					{labelDescription && (
						<span
							className={
								labelDescriptionClass ||
								"text-sm font-medium text-theme-secondary-500 dark:text-theme-secondary-700"
							}
							data-testid="list-divided-item__label--description"
						>
							{labelDescription}
						</span>
					)}
				</div>
				{value && (
					<div className={itemValueClass}>
						<span data-testid="list-divided-item__value">{value}</span>
					</div>
				)}
			</div>
		)}
		{content && (
			<div className={cn(contentClass)} data-testid="list-divided-item__content">
				{content}
			</div>
		)}
	</li>
);
