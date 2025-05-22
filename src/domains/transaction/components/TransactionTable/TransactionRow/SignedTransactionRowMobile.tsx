import { Contracts, DTO } from "@/app/lib/profiles";
import React, { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { SignButton } from "./SignedTransactionRow";
import { TableRow } from "@/app/components/Table";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { useMultiSignatureStatus } from "@/domains/transaction/hooks";
import { MobileCard } from "@/app/components/Table/Mobile/MobileCard";
import { MobileSection } from "@/app/components/Table/Mobile/MobileSection";
import { Divider } from "@/app/components/Divider";
import { TableRemoveButton } from "@/app/components/TableRemoveButton";
import { TimeAgo } from "@/app/components/TimeAgo";
import { DateTime } from "@/app/lib/intl";
import { TransactionRowAddressing } from "./TransactionRowAddressing";
import { TransactionAmountLabel, TransactionFiatAmount } from "./TransactionAmount.blocks";

interface SignedTransactionRowMobileProperties {
	transaction: DTO.ExtendedSignedTransactionData;
	onRowClick?: (transaction: DTO.ExtendedSignedTransactionData) => void;
	onRemovePendingTransaction?: (transaction: DTO.ExtendedSignedTransactionData) => void;
	wallet: Contracts.IReadWriteWallet;
}

export const SignedTransactionRowMobile = ({
	transaction,
	onRowClick,
	wallet,
	onRemovePendingTransaction,
}: SignedTransactionRowMobileProperties) => {
	const { t } = useTranslation();
	const timeStamp = transaction.timestamp();
	const { canBeSigned, isAwaitingFinalSignature, isAwaitingOurFinalSignature } = useMultiSignatureStatus({
		transaction,
		wallet,
	});

	const handleRemove = (event?: MouseEvent) => {
		event?.preventDefault();
		event?.stopPropagation();

		onRemovePendingTransaction?.(transaction);
	};

	return (
		<TableRow data-testid="TableRow__mobile" onClick={() => onRowClick?.(transaction)} border={false}>
			<td>
				<MobileCard className="mb-3">
					<div className="flex justify-between items-center px-4 w-full h-11 dark:bg-black bg-theme-secondary-100">
						<div className="text-sm font-semibold">
							<TruncateMiddle
								className="cursor-pointer text-theme-primary-600"
								text={transaction.hash()}
								maxChars={14}
								data-testid="SignedTransactionRowMobile__transaction-id"
							/>
						</div>

						<div className="flex flex-row items-center">
							<span className="hidden text-sm font-semibold sm:block text-theme-secondary-700">
								{timeStamp ? (
									<TimeAgo date={DateTime.fromUnix(timeStamp.toUNIX()).toISOString()} />
								) : (
									t("COMMON.NOT_AVAILABLE")
								)}
							</span>
							<Divider
								type="vertical"
								className="m-0 border-transparent sm:border-theme-secondary-300 sm:dark:border-theme-secondary-800"
							/>
							<SignButton
								canBeSigned={canBeSigned}
								isAwaitingFinalSignature={isAwaitingFinalSignature}
								isAwaitingOurFinalSignature={isAwaitingOurFinalSignature}
								onClick={() => onRowClick?.(transaction)}
								className="font-semibold"
							/>
							<Divider
								type="vertical"
								className="m-0 border-theme-secondary-300 dark:border-theme-secondary-800"
							/>
							<div>
								<TableRemoveButton
									onClick={handleRemove}
									className="p-0 m-0"
									data-testid="SignedTransactionRowMobile--remove"
								/>
							</div>
						</div>
					</div>

					<div className="flex flex-col gap-4 px-4 pt-3 pb-4 w-full sm:grid sm:pb-2 sm:grid-cols-[auto_auto_80px]">
						<MobileSection title={t("COMMON.TRANSFER")}>
							<TransactionRowAddressing
								transaction={transaction}
								profile={transaction.wallet().profile()}
							/>
						</MobileSection>

						<MobileSection title={`${t("COMMON.VALUE")} (${transaction.wallet().network().coinName()})`}>
							<TransactionAmountLabel transaction={transaction} />
						</MobileSection>

						<MobileSection title={t("COMMON.FIAT_VALUE")}>
							<TransactionFiatAmount transaction={transaction} />
						</MobileSection>

						<MobileSection title={t("COMMON.AGE")} className="sm:hidden">
							{timeStamp ? (
								<TimeAgo date={DateTime.fromUnix(timeStamp.toUNIX()).toISOString()} />
							) : (
								t("COMMON.NOT_AVAILABLE")
							)}
						</MobileSection>
					</div>
				</MobileCard>
			</td>
		</TableRow>
	);
};
