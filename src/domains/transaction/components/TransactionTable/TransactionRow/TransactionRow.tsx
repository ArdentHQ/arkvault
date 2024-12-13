import React, { memo } from "react";
import { useTranslation } from "react-i18next";

import { TransactionRowSkeleton } from "./TransactionRowSkeleton";
import { TransactionRowProperties } from "./TransactionRow.contracts";
import { TransactionRowMobile } from "./TransactionRowMobile";
import { TableCell, TableRow } from "@/app/components/Table";
import { useBreakpoint } from "@/app/hooks";
import { twMerge } from "tailwind-merge";
import { TimeAgo } from "@/app/components/TimeAgo";
import { DateTime } from "@ardenthq/sdk-intl";
import { Label } from "@/app/components/Label";
import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";
import { TransactionRowAddressing } from "./TransactionRowAddressing";
import { Amount } from "@/app/components/Amount";
import { TransactionTotalLabel, TransactionFiatAmount } from "./TransactionAmount.blocks";
import { TransactionRowId } from "./TransactionRowId";

export const TransactionRow = memo(
	({
		className,
		exchangeCurrency,
		transaction,
		onClick,
		isLoading = false,
		profile,
		...properties
	}: TransactionRowProperties) => {
		const { getLabel } = useTransactionTypes();
		const { isXs, isSm, isLgAndAbove } = useBreakpoint();
		const { t } = useTranslation();

		if (isXs || isSm) {
			return (
				<TransactionRowMobile
					isLoading={isLoading}
					onClick={onClick}
					transaction={transaction}
					exchangeCurrency={exchangeCurrency}
					profile={profile}
				/>
			);
		}

		if (isLoading) {
			return <TransactionRowSkeleton />;
		}

		const timeStamp = transaction.timestamp();

		return (
			<TableRow onClick={onClick} className={twMerge("relative", className)} {...properties}>
				<TableCell
					variant="start"
					innerClassName="items-start py-1 my-1 pr-0 lg:pr-3 min-h-14 xl:min-h-11 xl:max-h-11 xl:pt-2.5"
				>
					<div className="flex flex-col gap-1 font-semibold">
						<TransactionRowId transaction={transaction} />
						<span className="text-xs text-theme-secondary-700 xl:hidden">
							{timeStamp ? (
								<TimeAgo date={DateTime.fromUnix(timeStamp.toUNIX()).toISOString()} />
							) : (
								t("COMMON.NOT_AVAILABLE")
							)}
						</span>
					</div>
				</TableCell>

				<TableCell
					className="hidden xl:table-cell"
					innerClassName="text-sm text-theme-secondary-900 dark:text-theme-secondary-200 font-semibold items-start my-1 min-h-11 xl:max-h-11 xl:pt-3"
					data-testid="TransactionRow__timestamp"
				>
					{timeStamp ? (
						<TimeAgo date={DateTime.fromUnix(timeStamp.toUNIX()).toISOString()} />
					) : (
						t("COMMON.NOT_AVAILABLE")
					)}
				</TableCell>

				<TableCell innerClassName="items-start my-1 pt-2 min-h-14 xl:min-h-11 xl:pt-3">
					<Label
						color="secondary"
						size="xs"
						noBorder
						className="rounded px-1 py-[3px] dark:border"
						data-testid="TransactionRow__type"
					>
						{getLabel(transaction.type())}
					</Label>
				</TableCell>

				<TableCell innerClassName="space-x-4 items-start min-h-14 my-1 pt-2 px-0 lg:px-3 xl:pt-3 xl:min-h-11">
					<TransactionRowAddressing transaction={transaction} profile={profile} />
				</TableCell>

				<TableCell
					className="hidden lg:table-cell"
					innerClassName="justify-end items-start my-1 min-h-14 pt-2 xl:min-h-11 xl:my-0 xl:pt-3"
				>
					<div className="flex flex-col items-end gap-1">
						<TransactionTotalLabel transaction={transaction} />
						<span
							className="text-xs font-semibold text-theme-secondary-700 lg:hidden"
							data-testid="TransactionRow__exchange-currency"
						>
							<TransactionFiatAmount transaction={transaction} exchangeCurrency={exchangeCurrency} />
						</span>
					</div>
				</TableCell>

				<TableCell
					variant="end"
					innerClassName="justify-end items-start text-sm text-theme-secondary-900 dark:text-theme-secondary-200 font-semibold min-h-14 pt-2 xl:min-h-11 xl:my-0 xl:pt-3"
				>
					{isLgAndAbove ? (
						<Amount value={transaction.convertedTotal()} ticker={exchangeCurrency || ""} />
					) : (
						<div className="flex flex-col items-end gap-1">
							<TransactionTotalLabel transaction={transaction} />
							<span
								className="text-xs font-semibold text-theme-secondary-700 lg:hidden"
								data-testid="TransactionRow__exchange-currency"
							>
								<TransactionFiatAmount transaction={transaction} exchangeCurrency={exchangeCurrency} />
							</span>
						</div>
					)}
				</TableCell>
			</TableRow>
		);
	},
);

TransactionRow.displayName = "TransactionRow";
