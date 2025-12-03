import cn from "classnames";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { TransactionRowMobileSkeleton } from "./TransactionRowMobileSkeleton";
import { TransactionRowProperties } from "./TransactionRow.contracts";
import { TableRow } from "@/app/components/Table";
import { MobileCard } from "@/app/components/Table/Mobile/MobileCard";
import { DateTime } from "@/app/lib/intl";
import { TimeAgo } from "@/app/components/TimeAgo";
import { MobileSection } from "@/app/components/Table/Mobile/MobileSection";
import { TransactionRowAddressing } from "./TransactionRowAddressing";
import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";
import { TransactionTotalLabel, TransactionFiatAmount } from "./TransactionAmount.blocks";
import { TransactionRowId } from "./TransactionRowId";

export const TransactionRowMobile = memo(
	({
		className,
		transaction,
		onClick,
		isLoading = false,
		profile,
		exchangeCurrency,
		hideSender = false,
		...properties
	}: TransactionRowProperties) => {
		const { t } = useTranslation();
		const { getLabel } = useTransactionTypes();

		if (isLoading) {
			return <TransactionRowMobileSkeleton hideSender={hideSender} />;
		}

		const timeStamp = transaction.timestamp();

		return (
			<TableRow onClick={onClick} className={cn("group border-b-0!", className)} {...properties}>
				<td data-testid="TableRow__mobile">
					<MobileCard className="mb-3">
						<div className="bg-theme-secondary-100 dim:bg-theme-dim-950 flex h-10 w-full items-center justify-between px-4 dark:bg-black">
							<div>
								<TransactionRowId transaction={transaction} />
							</div>
							<div className="flex flex-row items-center">
								<span
									className="text-theme-secondary-700 dim:text-theme-dim-200 text-sm font-semibold sm:block"
									data-testid="TransactionRow__timestamp"
								>
									{timeStamp ? (
										<TimeAgo date={DateTime.fromUnix(timeStamp.toUNIX()).toISOString()} />
									) : (
										t("COMMON.NOT_AVAILABLE")
									)}
								</span>
							</div>
						</div>

						<div className="flex w-full flex-col gap-4 px-4 pt-3 pb-4 sm:grid sm:grid-cols-[200px_auto_130px] sm:pb-4">
							<MobileSection
								title={getLabel(transaction.type())}
								className="w-full"
								data-testid="TransactionRowMobile__label"
							>
								{hideSender ? (
									<TransactionRowAddressing transaction={transaction} profile={profile} />
								) : (
									<div className="flex flex-col gap-2">
										<TransactionRowAddressing
											transaction={transaction}
											profile={profile}
											isAdvanced
											variant="sender"
										/>
										<TransactionRowAddressing
											transaction={transaction}
											profile={profile}
											isAdvanced
											variant="recipient"
										/>
									</div>
								)}
							</MobileSection>

							<MobileSection
								title={`${t("COMMON.AMOUNT")} (${transaction.wallet().currency()})`}
								className="w-full"
							>
								<TransactionTotalLabel
									transaction={transaction}
									hideStyles={!hideSender}
									profile={profile}
								/>
							</MobileSection>

							<MobileSection title={t("COMMON.FIAT_VALUE")} className="w-full">
								<TransactionFiatAmount
									transaction={transaction}
									exchangeCurrency={exchangeCurrency}
									profile={profile}
								/>
							</MobileSection>
						</div>
					</MobileCard>
				</td>
			</TableRow>
		);
	},
);

TransactionRowMobile.displayName = "TransactionRowMobile";
