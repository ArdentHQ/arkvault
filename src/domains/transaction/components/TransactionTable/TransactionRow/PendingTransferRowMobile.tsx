import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { BaseTransactionRowAmount } from "./TransactionRowAmount";
import { BaseTransactionRowMode } from "./TransactionRowMode";
import { BaseTransactionRowRecipientLabel } from "./TransactionRowRecipientLabel";
import { TableRow } from "@/app/components/Table";
import { useTimeFormat } from "@/app/hooks/use-time-format";
import { ResponsiveAddressWrapper, RowLabel, RowWrapper } from "@/app/components/Table/Mobile/Row";
import { Link } from "@/app/components/Link";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";

export const PendingTransferRowMobile = ({
	transaction,
	onRowClick,
	wallet,
}: {
	transaction: DTO.ExtendedConfirmedTransactionData;
	onRowClick?: (transaction: DTO.ExtendedConfirmedTransactionData) => void;
	wallet: Contracts.IReadWriteWallet;
}) => {
	const { t } = useTranslation();
	const timeFormat = useTimeFormat();

	return (
		<TableRow data-testid="TableRow__mobile" onClick={() => onRowClick?.(transaction)}>
			<td data-testid="TableRow__mobile" className="flex-col space-y-4 py-4">
				<RowWrapper>
					<RowLabel>{t("COMMON.ID")}</RowLabel>
					<Link
						to={transaction.explorerLink()}
						tooltip={transaction.id()}
						showExternalIcon={false}
						isExternal
						data-testId="TransactionRow__transaction-id"
					>
						<TruncateMiddle text={transaction.id()} />
					</Link>
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.TIMESTAMP")}</RowLabel>
					<div data-testid="TransactionRow__timestamp" className="whitespace-nowrap">
						{transaction.timestamp()!.format(timeFormat)}
					</div>
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.SENDER")}</RowLabel>

					<ResponsiveAddressWrapper innerClassName="gap-2">
						<BaseTransactionRowMode
							className="flex items-center gap-x-2"
							isSent={transaction.isSent()}
							isReturn={transaction.isReturn()}
							type={transaction.type()}
							address={transaction.recipient()}
						/>

						<div className="w-0 flex-1 overflow-hidden">
							<BaseTransactionRowRecipientLabel
								type={transaction.type()}
								recipient={transaction.recipient()}
							/>
						</div>
					</ResponsiveAddressWrapper>
				</RowWrapper>
				<RowWrapper>
					<RowLabel>{t("COMMON.AMOUNT")}</RowLabel>
					<BaseTransactionRowAmount
						isSent={transaction.isSent()}
						total={transaction.amount() + transaction.fee()}
						wallet={wallet}
						isCompact={false}
					/>
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.STATUS")}</RowLabel>

					<span>{t("TRANSACTION.WAITING")}...</span>
				</RowWrapper>
			</td>
		</TableRow>
	);
};
