import cn from "classnames";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { TransactionRowMobileSkeleton } from "./TransactionRowMobileSkeleton";
import { TransactionRowProperties } from "./TransactionRow.contracts";
import { Link } from "@/app/components/Link";
import { TableRow } from "@/app/components/Table";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { MobileCard } from "@/app/components/Table/Mobile/MobileCard";
import { DateTime } from "@ardenthq/sdk-intl";
import { TimeAgo } from "@/app/components/TimeAgo";
import { MobileSection } from "@/app/components/Table/Mobile/MobileSection";
import { TransactionRowAddressing } from "./TransactionRowAddressing";
import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";
import { TransactionAmountLabel, TransactionFiatAmount } from "./TransactionAmount.blocks";

export const TransactionRowMobile = memo(
	({
		className,
		transaction,
		onClick,
		isLoading = false,
		profile,
		exchangeCurrency,
		...properties
	}: TransactionRowProperties) => {
		const { t } = useTranslation();
		const { getLabel } = useTransactionTypes();

		if (isLoading) {
			return <TransactionRowMobileSkeleton />;
		}

		const timeStamp = transaction.timestamp();

		return (
			<TableRow onClick={onClick} className={cn("group !border-b-0", className)} {...properties}>
				<td data-testid="TableRow__mobile">
					<MobileCard className="mb-3">
						<div className="flex h-10 w-full items-center justify-between bg-theme-secondary-100 px-4 dark:bg-black">
							<Link
								to={transaction.explorerLink()}
								tooltip={transaction.id()}
								showExternalIcon={false}
								isExternal
								className="text-sm font-semibold"
							>
								<TruncateMiddle
									className="cursor-pointer text-theme-primary-600"
									text={transaction.id()}
									maxChars={14}
									onClick={onClick}
								/>
							</Link>

							<div className="flex flex-row items-center">
								<span
									className="text-sm font-semibold text-theme-secondary-700 sm:block"
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

						<div className="flex w-full flex-col gap-4 px-4 pb-4 pt-3 sm:grid sm:grid-cols-[200px_auto_130px] sm:pb-2">
							<MobileSection
								title={getLabel(transaction.type())}
								className="w-full"
								data-testid="TransactionRowMobile__label"
							>
								<TransactionRowAddressing transaction={transaction} profile={profile} />
							</MobileSection>

							<MobileSection
								title={`${t("COMMON.VALUE")} (${transaction.wallet().currency()})`}
								className="w-full"
							>
								<TransactionAmountLabel transaction={transaction} />
							</MobileSection>

							<MobileSection title={t("COMMON.FIAT_VALUE")} className="w-full">
								<TransactionFiatAmount transaction={transaction} exchangeCurrency={exchangeCurrency} />
							</MobileSection>
						</div>
					</MobileCard>
				</td>
			</TableRow>
		);
	},
);

TransactionRowMobile.displayName = "TransactionRowMobile";
