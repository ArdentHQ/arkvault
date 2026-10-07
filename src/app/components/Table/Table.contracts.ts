import React from "react";
import { Column, TableState } from "react-table";

export interface TableProperties<RowDataType extends Record<never, unknown>> {
	children?: React.ReactNode | ((data: RowDataType, index: number) => void);
	className?: string;
	data: RowDataType[];
	columns: Column<RowDataType>[];
	hideHeader?: boolean;
	initialState?: Partial<TableState<RowDataType>>;
	rowsPerPage?: number;
	currentPage?: number;
	footer?: React.ReactNode;
	manualSortBy?: boolean;
	onSortChange?: (column: string, desc: boolean) => void;
	fixedLayout?: boolean;
	/**
	 * Stable identity for a row. Defaults to the row index, which makes React remount
	 * every row whenever one is inserted or removed above it. Pass this for lists that
	 * change while on screen (e.g. a new unconfirmed transaction) so existing rows
	 * keep their DOM nodes, their state and any layout they already measured.
	 */
	getRowId?: (row: RowDataType, index: number) => string;
}

export interface SortBy {
	column: string;
	desc: boolean;
}

export interface TableColumn {
	cellWidth?: string;
	sortDescFirst?: boolean;
	minimumWidth?: boolean;
	disableSortBy?: boolean;
	className?: string;
	headerClassName?: string;
}
