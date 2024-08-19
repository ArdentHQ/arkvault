import cn from "classnames";
import React from "react";
import { styled } from "twin.macro";

import { getStyles, TableRowStyleProperties } from "./TableRow.styles";

type TableRowProperties = {
	children: React.ReactNode;
} & TableRowStyleProperties &
	React.HTMLProps<any>;

const TableRowStyled = styled.tr<TableRowProperties>(getStyles);

export const TableRow: React.FC<TableRowProperties> = ({
	border = true,
	dotted,
	children,
	isSelected,
	onClick,
	className,
	...properties
}) => (
	<TableRowStyled
		data-testid={properties["data-testid"] || "TableRow"}
		className={cn({ group: !!onClick }, "relative", className)}
		border={border}
		dotted={dotted}
		isSelected={isSelected}
		onClick={onClick}
	>
		{children}
	</TableRowStyled>
);
