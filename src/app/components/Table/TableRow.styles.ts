import React from "react";

type TableRowFunction = (event: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => void;

const baseStyle = `transition-colors duration-100`;

const getCursorStyles = (onClick?: TableRowFunction) => onClick && `cursor-pointer`;

const getBorderStyles = (border?: boolean, dotted?: boolean) => {
	if (!border) {
		return;
	}

	return [
		`border-b last:border-b-0 border-theme-secondary-300 dark:border-theme-secondary-800`,
		dotted ? `border-dotted` : `border-dashed`,
	].join(" ");
};

const getHoverStyles = (isSelected?: boolean): string =>
	` table-row ${isSelected ? "table-row-selected" : "table-row-unselected"}`;

export interface TableRowStyleProperties {
	border?: boolean;
	dotted?: boolean;
	onClick?: TableRowFunction;
	isSelected?: boolean;
}

export const getStyles = ({ onClick, border, dotted, isSelected }: TableRowStyleProperties) => {
	const styles: Array<string | undefined> = [baseStyle, getBorderStyles(border, dotted), getCursorStyles(onClick)];

	if (onClick) {
		styles.push(getHoverStyles(isSelected));
	}

	return styles;
};
