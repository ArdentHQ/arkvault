import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";
import { TableRow } from "@/app/components/Table";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { MobileCard } from "@/app/components/Table/Mobile/MobileCard";
import { MobileSection } from "@/app/components/Table/Mobile/MobileSection";
import { Label } from "@/app/components/Label";
import { Amount, AmountLabel } from "@/app/components/Amount";
import { TimeAgo } from "@/app/components/TimeAgo";
import { DateTime } from "@ardenthq/sdk-intl";
import { Divider } from "@/app/components/Divider";

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
	const timeStamp = transaction.timestamp();

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
								onClick={() => onRowClick?.(transaction)}
								data-testid="PendingTransactionRow__transaction-id"
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
							<span className="flex flex-row items-center text-sm font-semibold text-theme-secondary-500">
								{t("TRANSACTION.WAITING")}...
							</span>
						</div>
					</div>

					<div className="flex w-full flex-col gap-4 px-4 pb-4 pt-3 sm:grid sm:grid-cols-[auto_auto_80px] sm:pb-2">
						<MobileSection title={t("COMMON.TRANSFER")}>
							<div className="flex flex-row items-center gap-2">
								<Label color="danger-bg" size="xs" noBorder className="rounded px-[11px] py-[3px]">
									{t("COMMON.TO")}
								</Label>
								<span className="text-sm">
									<TruncateMiddle
										className="cursor-pointer font-semibold text-theme-primary-600"
										text={transaction.recipient() || ""}
										maxChars={14}
										data-testid="PendingTransactionRowRecipientLabel"
									/>
								</span>
							</div>
						</MobileSection>

						<MobileSection title={`${t("COMMON.VALUE")} (${transaction.wallet().network().coinName()})`}>
							<AmountLabel
								value={transaction.amount() + transaction.fee()}
								isNegative={transaction.isSent()}
								ticker={wallet.currency()}
								isCompact
								className="py-[3px]"
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
