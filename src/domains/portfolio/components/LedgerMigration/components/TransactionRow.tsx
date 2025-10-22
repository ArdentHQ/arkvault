import React, { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { TransactionRowMobile } from "./TransactionRowMobile";
import { TableCell, TableRow } from "@/app/components/Table";
import { useBreakpoint } from "@/app/hooks";
import { Link } from "@/app/components/Link";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { TransactionConfirmationStatusLabel } from "./TransactionConfirmationStatusLabel";
import { DraftTransfer } from "@/app/lib/mainsail/draft-transfer";

export const TransactionRow = ({ transaction, }: { transaction: DraftTransfer }): ReactElement => {
	const { t } = useTranslation();
	const { isXs, isSm } = useBreakpoint();

	if (isXs || isSm) {
		return <TransactionRowMobile transaction={transaction} />;
	}

	return (
		<TableRow>
			<TableCell variant="start" >
				<TruncateMiddle
					className="font-semibold text-sm"
					text={transaction.sender().address()}
					maxChars={14}
				/>
			</TableCell>

			<TableCell variant="start">
				<TruncateMiddle
					className="font-semibold text-sm"
					text={transaction.recipient()?.address()!}
					maxChars={14}
				/>
			</TableCell>

			<TableCell>
				<TransactionConfirmationStatusLabel
					isCompleted={transaction.isCompleted()}
					isPending={transaction.isPending()}
				/>
			</TableCell>
			<TableCell variant="end">
				<div className="flext justify-end w-full">
					<Link to={transaction.signedTransaction()?.explorerLink()!} isExternal>
						{t("COMMON.VIEW")}
					</Link>
				</div>
			</TableCell>
		</TableRow>
	);
}
