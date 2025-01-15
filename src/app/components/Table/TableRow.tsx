import cn from "classnames";
import React from "react";

import { getStyles, TableRowStyleProperties } from "./TableRow.styles";
import { twMerge } from "tailwind-merge";

type TableRowProperties = {
	children: React.ReactNode;
} & TableRowStyleProperties &
	React.HTMLProps<any>;

const TableRowStyled = ({
	border,
	className,
	isSelected,
	...props
}: React.HTMLProps<HTMLTableRowElement> & TableRowProperties) => (
	<tr {...props} className={twMerge(getStyles({ ...props, border, isSelected }), className)} />
);

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
		className={cn("group", className)}
		border={border}
		dotted={dotted}
		isSelected={isSelected}
		onClick={onClick}
	>
		{children}
	</TableRowStyled>
);
