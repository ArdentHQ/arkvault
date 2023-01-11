import { chunk } from "@ardenthq/sdk-helpers";
import cn from "classnames";
import React, { useMemo } from "react";
import { HeaderGroup, useSortBy, useTable } from "react-table";
import { styled } from "twin.macro";

import { TableProperties } from "./Table.contracts";
import { defaultTableStyle } from "./Table.styles";
import { Icon } from "@/app/components/Icon";

const TableWrapper = styled.div`
	${defaultTableStyle}
`;

export const Table = <RowDataType extends Record<never, unknown>>({
	children,
	data,
	columns,
	hideHeader = false,
	className,
	initialState,
	rowsPerPage,
	currentPage = 1,
	...properties
}: TableProperties<RowDataType>) => {
	const tableData = useMemo(() => data, [data]);
	const tableColumns = useMemo(() => columns, [columns]);

	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<RowDataType>(
		{
			autoResetSortBy: false,
			columns: tableColumns,
			data: tableData,
			disableSortRemove: true,
			initialState,
		},
		useSortBy,
	);

	const rowsList = useMemo(() => {
		if (!rowsPerPage || rows.length === 0) {
			return rows;
		}

		return chunk(rows, rowsPerPage)[currentPage - 1] || [];
	}, [currentPage, rows, rowsPerPage]);

	const renderChildNode = (rowData: RowDataType, index: number) => {
		if (typeof children === "function") {
			return children(rowData, index);
		}
		return <tr />;
	};

	const renderHeaderGroup = (headerGroup: HeaderGroup<RowDataType>) => (
		<tr
			className="border-b border-theme-secondary-300 dark:border-theme-secondary-800"
			{...headerGroup.getHeaderGroupProps()}
		>
			{headerGroup.headers.map(renderColumn)}
		</tr>
	);

	const renderColumn = (column: HeaderGroup<RowDataType>, thIndex: number) => {
		const thElementClassName = cn(
			"group relative text-sm text-left select-none text-theme-secondary-500 border-theme-secondary-300 dark:text-theme-secondary-700 dark:border-theme-secondary-800 m-0 p-3 first:pl-0 last:pr-0 font-semibold",
			column.headerClassName,
			{ "w-1": column.minimumWidth },
			{
				[`${column.cellWidth} min-${column.cellWidth}`]: !column.minimumWidth && column.cellWidth,
			},
		);
		const rootDivClassName = cn("flex flex-inline align-top", column.className, {
			"flex-row-reverse": column.className?.includes("justify-end") && !column.disableSortBy,
		});
		const iconDivClassName = cn(
			"flex items-center text-theme-secondary-500 dark:text-theme-secondary-700 transition-opacity",
			{ "opacity-0 group-hover:opacity-100": !column.isSorted },
			{
				"ml-2": !column.className?.includes("justify-end"),
				"ml-auto mr-2": column.className?.includes("justify-end"),
			},
		);
		const iconSortClassName: string = cn("transition-transform", {
			"rotate-180": (column.isSorted && !column.isSortedDesc) || (!column.isSorted && !column.sortDescFirst),
		});

		return (
			<th
				className={thElementClassName}
				data-testid={`table__th--${thIndex}`}
				{...column.getHeaderProps(column.getSortByToggleProps())}
			>
				<div className={rootDivClassName}>
					<div className={cn({ "whitespace-nowrap": column.noWrap })}>{column.render("Header")}</div>
					{!column.hideSortArrow && column.canSort && (
						<div className={iconDivClassName}>
							<Icon role="img" name="ChevronDownSmall" className={iconSortClassName} size="sm" />
						</div>
					)}
				</div>
			</th>
		);
	};

	const renderHeader = <thead>{headerGroups.map(renderHeaderGroup)}</thead>;

	return (
		<TableWrapper {...properties} {...getTableProps({ className })} className={cn({ "-mt-3": !hideHeader })}>
			<table cellPadding={0} className="table-auto">
				{!hideHeader && renderHeader}

				<tbody {...getTableBodyProps()}>
					{rowsList.map((row) => {
						prepareRow(row);
						return { ...renderChildNode(row.original, row.index), ...row.getRowProps() };
					})}
				</tbody>
			</table>
		</TableWrapper>
	);
};
