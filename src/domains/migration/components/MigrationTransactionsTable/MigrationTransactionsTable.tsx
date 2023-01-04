import React, { FC, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Column, TableState } from "react-table";

import { EmptyBlock } from "@/app/components/EmptyBlock";
import { Table } from "@/app/components/Table";
import { useBreakpoint } from "@/app/hooks";

import { MigrationTransactionsRow } from "./MigrationTransactionsRow";
import { MigrationTransactionsTableProperties } from "./MigrationTransactionsTable.contracts";
import { MigrationTransactionsRowMobile } from "@/domains/migration/components/MigrationTransactionsTable/MigrationTransactionsRowMobile";

export const MigrationTransactionsTable: FC<MigrationTransactionsTableProperties> = ({
	migrationTransactions,
	isCompact,
	onClick,
}) => {
	const { t } = useTranslation();

	const initialState = useMemo<Partial<TableState<any>>>(
		() => ({
			sortBy: [
				{
					desc: true,
					id: "createdAt",
				},
			],
		}),
		[],
	);

	const { isXs, isSm } = useBreakpoint();

	const useResponsive = useMemo(() => isXs || isSm, [isXs, isSm]);

	const columns = useMemo<Column<any>[]>(
		() => [
			{
				Header: t("COMMON.ID"),
				minimumWidth: true,
			},
			{
				Header: t("COMMON.DATE"),
				accessor: "createdAt",
				headerClassName: "hidden lg:table-cell",
			},
			{
				Header: t("COMMON.SENDER"),
			},
			{
				Header: t("COMMON.MIGRATION_ADDRESS"),
			},
			{
				Header: t("COMMON.STATUS"),
				cellWidth: "w-24",
				className: "justify-center",
			},
			{
				Header: t("COMMON.AMOUNT"),
			},
			{
				Header: "Actions",
				className: "hidden",
				headerClassName: "no-border",
				minimumWidth: true,
			},
		],
		[t],
	);

	const tableData = useMemo(() => migrationTransactions, [migrationTransactions]);

	const renderTableRow = useCallback(
		(migrationTransaction: any) => {
			if (useResponsive) {
				return <MigrationTransactionsRowMobile migrationTransaction={migrationTransaction} onClick={onClick} />;
			}

			return (
				<MigrationTransactionsRow
					migrationTransaction={migrationTransaction}
					isCompact={isCompact}
					onClick={onClick}
				/>
			);
		},
		[isCompact, onClick, useResponsive],
	);

	if (tableData.length === 0) {
		return (
			<EmptyBlock data-testid="MigrationTransactionsTable__empty-message">
				{t("MIGRATION.PAGE_MIGRATION.NO_MIGRATIONS")}
			</EmptyBlock>
		);
	}

	return (
		<div data-testid="MigrationTransactionsTable">
			<Table columns={columns} data={tableData} initialState={initialState} hideHeader={useResponsive}>
				{renderTableRow}
			</Table>
		</div>
	);
};
