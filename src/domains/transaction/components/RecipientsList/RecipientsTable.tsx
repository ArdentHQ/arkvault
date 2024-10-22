import React, { FC, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Column } from "react-table";
import { TableWrapper } from "@/app/components/Table/TableWrapper";
import { Table, TableCell, TableRow } from "@/app/components/Table";
import {
	RecipientItem,
	RecipientsProperties,
} from "@/domains/transaction/components/RecipientsList/RecipientList.contracts";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";

export const RecipientsTable: FC<RecipientsProperties> = ({ recipients, ticker }) => {
	const { t } = useTranslation();

	const columns = useMemo<Column<RecipientItem>[]>(
		() => [
			{
				Header: t("COMMON.ADDRESS"),
				accessor: "alias",
			},
			{
				Header: t("COMMON.AMOUNT"),
				accessor: "amount",
				className: "justify-end",
				headerClassName: "no-border",
			},
		],
		[t],
	);

	const renderTableRow = useCallback(
		(recipient: RecipientItem, index: number) => (
			<TableRow key={index} border className="relative">
				<TableCell variant="start" innerClassName="space-x-4 pl-6">
					<Address
						walletName={recipient.alias}
						address={recipient.address}
						truncateOnTable
						showCopyButton
						walletNameClass="text-sm text-theme-secondary-900 dark:text-theme-secondary-200 leading-[17px]"
						addressClass="text-sm text-theme-secondary-700 dark:text-theme-secondary-500 leading-[17px] flex items-center h-5"
					/>
				</TableCell>

				<TableCell innerClassName="justify-end pr-6">
					<span className="whitespace-nowrap text-sm font-semibold leading-[17px]">
						<Amount ticker={ticker} value={recipient.amount as number} />
					</span>
				</TableCell>
			</TableRow>
		),
		[ticker],
	);

	return (
		<TableWrapper>
			<Table className="with-x-padding overflow-hidden rounded-xl" columns={columns} data={recipients}>
				{renderTableRow}
			</Table>
		</TableWrapper>
	);
};
