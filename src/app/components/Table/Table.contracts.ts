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
