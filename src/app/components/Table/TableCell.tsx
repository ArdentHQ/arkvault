import React from "react";
import { getStyles } from "./TableCell.styles";
import { twMerge } from "tailwind-merge";

type TableCellProperties = {
	variant?: "start" | "middle" | "end";
	size?: "sm" | "base";
	className?: string;
	innerClassName?: string;
	children: React.ReactNode;
} & Omit<React.HTMLProps<any>, "size">;

const TableCellInnerWrapper = ({ ...props }) => <div {...props} />;

export const TableCell = ({
	variant = "middle",
	size,
	className,
	innerClassName,
	children,
	...properties
}: TableCellProperties) => (
	<td className={className} {...properties}>
		<TableCellInnerWrapper className={twMerge(getStyles({ size, variant }), innerClassName)}>
			{children}
		</TableCellInnerWrapper>
	</td>
);
