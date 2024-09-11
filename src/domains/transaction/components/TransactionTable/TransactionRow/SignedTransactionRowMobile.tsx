import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React, { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { BaseTransactionRowAmount } from "./TransactionRowAmount";
import { BaseTransactionRowMode } from "./TransactionRowMode";
import { BaseTransactionRowRecipientLabel } from "./TransactionRowRecipientLabel";
import { SignButton } from "./SignedTransactionRow";
import { TableRow } from "@/app/components/Table";
import { useTimeFormat } from "@/app/hooks/use-time-format";
import { ResponsiveAddressWrapper, RowLabel, RowWrapper } from "@/app/components/Table/Mobile/Row";
import { Link } from "@/app/components/Link";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { Icon } from "@/app/components/Icon";
import { Button } from "@/app/components/Button";
import { useMultiSignatureStatus } from "@/domains/transaction/hooks";
interface SignedTransactionRowMobileProperties {
	transaction: DTO.ExtendedSignedTransactionData;
	onSign?: (transaction: DTO.ExtendedSignedTransactionData) => void;
	onRowClick?: (transaction: DTO.ExtendedSignedTransactionData) => void;
	onRemovePendingTransaction?: (transaction: DTO.ExtendedSignedTransactionData) => void;
	wallet: Contracts.IReadWriteWallet;
}

export const SignedTransactionRowMobile = ({
	transaction,
	onSign,
	onRowClick,
	wallet,
	onRemovePendingTransaction,
}: SignedTransactionRowMobileProperties) => {
	const { t } = useTranslation();
	const timeFormat = useTimeFormat();
	const recipient = transaction.get<string>("recipientId");
	const { canBeSigned, isAwaitingFinalSignature, isAwaitingOurFinalSignature, status } = useMultiSignatureStatus({
		transaction,
		wallet,
	});

	const handleRemove = (event?: MouseEvent) => {
		event?.preventDefault();
		event?.stopPropagation();

		onRemovePendingTransaction?.(transaction);
	};

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
					>
						<TruncateMiddle text={transaction.id()} />
					</Link>
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.TIMESTAMP")}</RowLabel>
					<div data-testid="TransactionRow__timestamp" className="whitespace-nowrap">
						{transaction.timestamp().format(timeFormat)}
					</div>
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.SENDER")}</RowLabel>

					<ResponsiveAddressWrapper>
						<BaseTransactionRowMode
							className="flex items-center gap-x-2"
							isSent={true}
							type={transaction.type()}
							address={recipient}
						/>

						<div className="ml-2 overflow-hidden">
							<BaseTransactionRowRecipientLabel type={transaction.type()} recipient={recipient} />
						</div>
					</ResponsiveAddressWrapper>
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.AMOUNT")}</RowLabel>
					<BaseTransactionRowAmount
						isSent={true}
						total={transaction.amount() + transaction.fee()}
						wallet={wallet}
						isCompact={false}
					/>
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.STATUS")}</RowLabel>

					<div className="flex items-center gap-x-2">
						{status.label}
						<span className={`p-1 ${status.className}`}>
							<Icon name={status.icon} size="lg" />
						</span>
					</div>
				</RowWrapper>

				<RowWrapper>
					<SignButton
						className="flex-grow"
						canBeSigned={canBeSigned}
						isAwaitingFinalSignature={isAwaitingFinalSignature}
						isAwaitingOurFinalSignature={isAwaitingOurFinalSignature}
						onClick={() => onSign?.(transaction)}
					/>

					<Button
						className={cn("flex items-center", {
							"ml-auto flex-grow sm:flex-grow-0": !canBeSigned,
						})}
						data-testid="SignedTransactionRowMobile--remove"
						variant="danger"
						onClick={handleRemove}
					>
						<Icon name="Trash" size="lg" />

						{!canBeSigned && <span className="sm:hidden">{t("COMMON.REMOVE")}</span>}
					</Button>
				</RowWrapper>
			</td>
		</TableRow>
	);
};
