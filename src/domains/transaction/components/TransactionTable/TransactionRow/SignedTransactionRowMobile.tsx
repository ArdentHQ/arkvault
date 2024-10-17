import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React, { MouseEvent, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { SignButton } from "./SignedTransactionRow";
import { TableRow } from "@/app/components/Table";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { useMultiSignatureStatus } from "@/domains/transaction/hooks";
import { MobileCard } from "@/app/components/Table/Mobile/MobileCard";
import { MobileSection } from "@/app/components/Table/Mobile/MobileSection";
import { Divider } from "@/app/components/Divider";
import { Tooltip } from "@/app/components/Tooltip";
import { assertString } from "@/utils/assertions";
import { getMultiSignatureInfo } from "@/domains/transaction/components/MultiSignatureDetail/MultiSignatureDetail.helpers";
import { TableRemoveButton } from "@/app/components/TableRemoveButton";
import { Amount, AmountLabel } from "@/app/components/Amount";
import { TimeAgo } from "@/app/components/TimeAgo";
import { DateTime } from "@ardenthq/sdk-intl";
import { TransactionRowAddressing } from "./TransactionRowAddressing";

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

	const canBeDeleted = useMemo(() => {
		const publicKey = transaction.wallet().publicKey();

		assertString(publicKey);

		const musigInfo = getMultiSignatureInfo(transaction);
		return musigInfo.publicKeys.includes(publicKey);
	}, [transaction]);

	return (
		<TableRow data-testid="TableRow__mobile" onClick={() => onRowClick?.(transaction)} border={false}>
			<td>
				<MobileCard className="mb-3">
					<div className="flex h-11 w-full items-center justify-between bg-theme-secondary-100 px-4 dark:bg-black">
						<div className="text-sm font-semibold">
							<TruncateMiddle
								className="cursor-pointer text-theme-primary-600"
								text={transaction.id()}
								maxChars={14}
								data-testid="SignedTransactionRowMobile__transaction-id"
							/>
						</div>

						<div className="flex flex-row items-center">
							<span className="hidden text-sm font-semibold text-theme-secondary-700 sm:block">
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
							<Tooltip
								content={
									canBeDeleted
										? undefined
										: t("TRANSACTION.MULTISIGNATURE.PARTICIPANTS_CAN_REMOVE_PENDING_MUSIG")
								}
							>
								<div>
									<TableRemoveButton
										isDisabled={!canBeDeleted}
										onClick={handleRemove}
										className="m-0 p-0"
										data-testid="SignedTransactionRowMobile--remove"
									/>
								</div>
							</Tooltip>
						</div>
					</div>

					<div className="flex w-full flex-col gap-4 px-4 pb-4 pt-3 sm:grid sm:grid-cols-[auto_auto_80px] sm:pb-2">
						<MobileSection title={t("COMMON.TRANSFER")}>
							<TransactionRowAddressing
								transaction={transaction}
								profile={transaction.wallet().profile()}
							/>
						</MobileSection>

						<MobileSection title={`${t("COMMON.VALUE")} (${transaction.wallet().network().coinName()})`}>
							<AmountLabel
								value={transaction.amount() + transaction.fee()}
								isNegative={transaction.isSent()}
								ticker={transaction.wallet().currency()}
								isCompact
								className="h-[21px]"
							/>
						</MobileSection>

						<MobileSection title={t("COMMON.FIAT_VALUE")}>
							<Amount value={wallet.convertedBalance()} ticker={wallet.exchangeCurrency()} />
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
