import React from "react";
import { ListDividedItemProperties } from "./ListDivided.contracts";

import { ListDividedItem } from "./ListDividedItem";
import { twMerge } from "tailwind-merge";
import cn from "classnames";

interface Properties {
	items?: ListDividedItemProperties[];
	noBorder?: boolean;
}

const StyledList = ({ noBorder, ...props }: { noBorder: boolean } & React.HTMLAttributes<HTMLUListElement>) => (
	<ul
		{...props}
		className={twMerge(
			"[&>li]:border-b [&>li]:border-dashed [&>li]:border-theme-secondary-300 dark:[&>li]:border-theme-secondary-800",
			cn({
				"[&>li:last-child]:border-b-0": noBorder,
			}),
			props.className,
		)}
	/>
);

const renderItems = (items: ListDividedItemProperties[], noBorder: boolean) => (
	<StyledList data-testid="list-divided__items" noBorder={noBorder}>
		{items.map((item: ListDividedItemProperties, index: number) => (
			<ListDividedItem {...item} key={index} />
		))}
	</StyledList>
);

export const ListDivided = ({ items = [], noBorder = true }: Properties) => {
	const emptyList = <span data-testid="list-divided__empty">empty</span>;

	return items.length > 0 ? renderItems(items, noBorder) : emptyList;
};
