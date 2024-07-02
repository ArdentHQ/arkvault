import React from "react";
import tw, { styled } from "twin.macro";

import { ListDividedItemProperties } from "./ListDivided.contracts";
import { ListDividedItem } from "./ListDividedItem";

interface Properties {
	items?: ListDividedItemProperties[];
	noBorder?: boolean;
}

const StyledList = styled.ul<{ noBorder: boolean }>(({ noBorder }) => ({
	"> li": tw`border-b border-dashed border-theme-secondary-300 dark:border-theme-secondary-800`,
	"> li:last-child": noBorder ? tw`border-b-0` : undefined,
}));

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
