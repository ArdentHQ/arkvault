import React from "react";
import { getStyles } from "./TableCell.styles";
import { twMerge } from "tailwind-merge";

type TableCellProperties = {
	variant?: "start" | "middle" | "end";
	size?: "sm" | "base";
	className?: string;
	innerClassName?: string;
	children: React.ReactNode;
	isSelected?: boolean;
} & Omit<React.HTMLProps<any>, "size">;

const TableCellInnerWrapper = ({ ...props }) => <div {...props} />;

export const TableCell = ({
	variant = "middle",
	size,
	className,
	innerClassName,
	children,
	isSelected = false,
	...properties
}: TableCellProperties) => (
	<td className={className} {...properties}>
		<TableCellInnerWrapper className={twMerge(getStyles({ isSelected, size, variant }), innerClassName)}>
			{children}
		</TableCellInnerWrapper>
	</td>
);
