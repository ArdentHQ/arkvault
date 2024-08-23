import React from "react";
import { styled, TwStyle } from "twin.macro";

import { getStyles } from "./TableCell.styles";

type TableCellProperties = {
	variant?: "start" | "middle" | "end";
	size?: "sm" | "base";
	className?: string;
	innerClassName?: TwStyle | string;
	isCompact?: boolean;
	children: React.ReactNode;
} & Omit<React.HTMLProps<any>, "size">;

const TableCellInnerWrapper = styled.div<TableCellProperties>`
	${({ className }) => className}
	${getStyles}
`;

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
		<TableCellInnerWrapper
			variant={variant}
			size={size}
			css={typeof innerClassName !== "string" ? innerClassName : ""}
			className={typeof innerClassName === "string" ? innerClassName : ""}
			isCompact={isCompact}
		>
			{children}
		</TableCellInnerWrapper>
	</td>
);
