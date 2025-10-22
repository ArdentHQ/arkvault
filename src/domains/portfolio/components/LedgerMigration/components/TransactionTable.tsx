import React, { ReactElement } from "react";
import { Column } from "react-table";

import { TransactionRow } from "./TransactionRow";
import { Table } from "@/app/components/Table";
import { useBreakpoint } from "@/app/hooks";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { DraftTransfer } from "@/app/lib/mainsail/draft-transfer";


export const TransactionTable = ({ transactions }: { transactions: DraftTransfer[] }): ReactElement => {
	const { isMdAndAbove } = useBreakpoint();
	const { t } = useTranslation();

	const columns: Column<DataTransfer>[] = [
		{
			Header: t("COMMON.OLD"),
			cellWidth: "w-36 xl:w-48",
			headerClassName: "no-border whitespace-nowrap",
			noRoundedBorders: true,
		},
		{
			Header: t("COMMON.NEW"),
			headerClassName: "no-border",
		},
		{
			Header: t("COMMON.STATUS"),
			cellWidth: "w-fit lg:w-24",
			headerClassName: "no-border whitespace-nowrap",
		},
		{
			Header: t("COMMON.TX_ID"),
			cellWidth: "w-36 xl:w-48",
			headerClassName: "no-border whitespace-nowrap",
			noRoundedBorders: true,
		},
	];

	return (
		<div data-testid="TransactionTable" className="relative">
			<Table
				columns={columns}
				data={transactions}
				className={cn({ "with-x-padding": isMdAndAbove })}
			>
				{(transaction: DraftTransfer) => (<TransactionRow transaction={transaction} />)}
			</Table>
		</div>
	);
};
