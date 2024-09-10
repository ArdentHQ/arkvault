import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";

import { useTranslation } from "react-i18next";
import { TableCell, TableRow } from "@/app/components/Table";
import { TimeAgo } from "@/app/components/TimeAgo";
import { TransactionRowAmount } from "@/domains/transaction/components/TransactionTable/TransactionRow/TransactionRowAmount";
import { TransactionRowRecipient } from "@/domains/transaction/components/TransactionTable/TransactionRow/TransactionRowRecipient";
import { useBreakpoint } from "@/app/hooks";
import { RowWrapper, RowLabel } from "@/app/components/Table/Mobile/Row";

type Properties = {
	transaction: DTO.ExtendedConfirmedTransactionData;
	profile: Contracts.IProfile;
} & React.HTMLProps<any>;

export const UnconfirmedTransactionRow = ({ transaction, profile, ...properties }: Properties) => {
	const { t } = useTranslation();
	const { isXs, isSm } = useBreakpoint();
	const isCompact = true;

	if (isXs || isSm) {
		return (
			<TableRow {...properties}>
				<td data-testid="TableRow__mobile" className="flex-col space-y-4 py-4">
					<RowWrapper>
						<RowLabel>{t("COMMON.RECIPIENT")}</RowLabel>

						<div className="flex w-0 flex-1 flex-row-reverse items-center justify-end space-x-4 overflow-hidden">
							<TransactionRowRecipient transaction={transaction} profile={profile} isCompact={true} />
						</div>
					</RowWrapper>

					<RowWrapper>
						<RowLabel>{t("COMMON.DATE")}</RowLabel>
						<div className="whitespace-nowrap text-theme-secondary-500">
							<TimeAgo date={transaction.timestamp()?.toString() as string} />
						</div>
					</RowWrapper>

					<RowWrapper>
						<RowLabel>{t("COMMON.AMOUNT")}</RowLabel>

						<TransactionRowAmount transaction={transaction} exchangeTooltip isCompact={false} />
					</RowWrapper>
				</td>
			</TableRow>
		);
	}

	return (
		<TableRow {...properties}>
			<TableCell
				variant="start"
				innerClassName="space-x-3 text-theme-secondary-500 whitespace-nowrap"
				isCompact={isCompact}
			>
				<TimeAgo date={transaction.timestamp()?.toString() as string} />
			</TableCell>

			<TableCell innerClassName="space-x-4" isCompact={isCompact}>
				<TransactionRowRecipient transaction={transaction} profile={profile} isCompact={isCompact} />
			</TableCell>

			<TableCell variant="end" innerClassName="justify-end" isCompact={isCompact}>
				<TransactionRowAmount transaction={transaction} isCompact={isCompact} />
			</TableCell>
		</TableRow>
	);
};
