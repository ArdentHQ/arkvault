import React, { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { TableCell, TableRow } from "@/app/components/Table";
import { Link } from "@/app/components/Link";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { TransactionConfirmationStatusLabel } from "./TransactionConfirmationStatusLabel";
import { DraftTransfer } from "@/app/lib/mainsail/draft-transfer";

export const TransactionRow = ({ transaction }: { transaction: DraftTransfer }): ReactElement => {
	const { t } = useTranslation();
	return (
		<TableRow data-testid="TransactionRow">
			<TableCell variant="start">
				<TruncateMiddle className="text-sm font-semibold" text={transaction.sender().address()} maxChars={14} />
			</TableCell>

			<TableCell>
				<TruncateMiddle
					className="text-sm font-semibold"
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
				<div className="flext w-full justify-end text-right whitespace-nowrap">
					{transaction.isCompleted() && (
						<Link to={transaction.signedTransaction()?.explorerLink()!} isExternal>
							{t("COMMON.VIEW")}
						</Link>
					)}
				</div>
			</TableCell>
		</TableRow>
	);
};
