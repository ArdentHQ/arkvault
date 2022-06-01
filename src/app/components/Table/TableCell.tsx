import React from "react";
import { styled } from "twin.macro";

import { getStyles } from "./TableCell.styles";

type TableCellProperties = {
	variant?: "start" | "middle" | "end";
	size?: "sm" | "base";
	className?: string;
	innerClassName?: string;
	isCompact?: boolean;
	children: React.ReactNode;
} & Omit<React.HTMLProps<any>, "size">;

const TableCellInnerWrapper = styled.div<TableCellProperties>(getStyles);

export const TableCell = ({
	variant = "middle",
	size,
	className,
	innerClassName,
	isCompact,
	children,
	...properties
}: TableCellProperties) => (
	<td className={className} {...properties}>
		<TableCellInnerWrapper variant={variant} size={size} className={innerClassName} isCompact={isCompact}>
			{children}
		</TableCellInnerWrapper>
	</td>
);
