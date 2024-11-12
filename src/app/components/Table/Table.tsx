import { chunk } from "@ardenthq/sdk-helpers";
import cn from "classnames";
import React, { useMemo } from "react";
import { HeaderGroup, useSortBy, useTable } from "react-table";
import { styled } from "twin.macro";

import { TableProperties } from "./Table.contracts";
import { defaultTableStyle } from "./Table.styles";
import { Icon } from "@/app/components/Icon";
import { twMerge } from "tailwind-merge";

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

	const renderHeaderGroup = (headerGroup: HeaderGroup<RowDataType>) => {
		const { key, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
		return (
			<tr key={key} {...headerGroupProps}>
				{headerGroup.headers.map(renderColumn)}
			</tr>
		);
	};

	const renderColumn = (column: HeaderGroup<RowDataType>, thIndex: number) => {
		const thElementClassName = twMerge(
			"group relative text-sm text-left select-none text-theme-secondary-700 border-theme-secondary-300 dark:text-theme-secondary-500 dark:border-theme-secondary-800 m-0 p-3 first:pl-6 last:pr-6 font-semibold bg-theme-secondary-100 dark:bg-black ",
			column.headerClassName,
			column.minimumWidth && "w-1",
			!column.noRoundedBorders && "first:rounded-tl-xl last:rounded-tr-xl",
			!column.minimumWidth && column.cellWidth && `${column.cellWidth} min-${column.cellWidth}`,
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

		const { key, ...headerProps } = column.getHeaderProps(column.getSortByToggleProps());

		return (
			<th className={thElementClassName} data-testid={`table__th--${thIndex}`} key={key} {...headerProps}>
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
		<TableWrapper {...getTableProps({ className })}>
			<table cellPadding={0} className="w-full table-auto">
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
