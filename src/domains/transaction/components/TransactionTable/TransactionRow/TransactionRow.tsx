import React, { memo } from "react";
import { useTranslation } from "react-i18next";

import { TransactionRowSkeleton } from "./TransactionRowSkeleton";
import { TransactionRowProperties } from "./TransactionRow.contracts";
import { TransactionRowMobile } from "./TransactionRowMobile";
import { TableCell, TableRow } from "@/app/components/Table";
import { useBreakpoint } from "@/app/hooks";
import { twMerge } from "tailwind-merge";
import { TimeAgo } from "@/app/components/TimeAgo";
import { DateTime } from "@/app/lib/intl";
import { Label } from "@/app/components/Label";
import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";
import { TransactionRowAddressing } from "./TransactionRowAddressing";
import { Amount } from "@/app/components/Amount";
import { TransactionTotalLabel, TransactionFiatAmount } from "./TransactionAmount.blocks";
import { TransactionRowId } from "./TransactionRowId";
import cn from "classnames";

export const TransactionRow = memo(
	({
		className,
		exchangeCurrency,
		transaction,
		onClick,
		isLoading = false,
		profile,
		hideSender = false,
		...properties
	}: TransactionRowProperties) => {
		const { getLabel } = useTransactionTypes();
		const { isXs, isSm, isXl } = useBreakpoint();
		const { t } = useTranslation();

		if (isXs || isSm) {
			return (
				<TransactionRowMobile
					isLoading={isLoading}
					onClick={onClick}
					transaction={transaction}
					exchangeCurrency={exchangeCurrency}
					profile={profile}
					hideSender={hideSender}
				/>
			);
		}

		if (isLoading) {
			return <TransactionRowSkeleton hideSender={hideSender} />;
		}

		const timeStamp = transaction.timestamp();

		return (
			<TableRow onClick={onClick} className={twMerge("relative", className)} {...properties}>
				<TableCell
					variant="start"
					innerClassName={cn("items-start pr-0 lg:pr-3 xl:min-h-11 xl:max-h-11 xl:pt-2.5 lg:min-w-36", {
						"min-h-14 my-1 pt-1": hideSender,
						"min-h-[66px] py-1 my-0 md-lg:min-h-14": !hideSender,
					})}
				>
					<div className="flex flex-col gap-1 font-semibold">
						<TransactionRowId transaction={transaction} />
						<span className="text-theme-secondary-700 dim:text-theme-dim-200 text-xs xl:hidden">
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
					innerClassName={cn(
						"text-sm text-theme-secondary-900 dark:text-theme-secondary-200 font-semibold items-start my-1 min-h-11 xl:max-h-11 xl:pt-3",
						{
							"lg:min-w-40": hideSender,
							"xl:min-w-32": !hideSender,
						},
					)}
					data-testid="TransactionRow__timestamp"
				>
					{timeStamp ? (
						<TimeAgo date={DateTime.fromUnix(timeStamp.toUNIX()).toISOString()} />
					) : (
						t("COMMON.NOT_AVAILABLE")
					)}
				</TableCell>

				<TableCell
					innerClassName={cn("items-start xl:min-h-11 xl:pt-3", {
						"min-h-14 my-1 pt-2": hideSender,
						"min-h-[66px] py-1 my-0 md-lg:min-h-14 md-lg:pt-2 lg:w-24 lg:min-w-24 xl:min-w-38 xl:w-auto":
							!hideSender,
					})}
				>
					<Label
						color="secondary"
						size="xs"
						noBorder
						className="max-w-40 truncate rounded px-1 py-[3px] whitespace-nowrap dark:border"
						data-testid="TransactionRow__type"
					>
						{getLabel(transaction.type())}
					</Label>
				</TableCell>

				<TableCell
					className={cn({
						hidden: hideSender,
					})}
					innerClassName={cn("space-x-4 items-start px-0 lg:px-3 xl:pt-3 xl:min-h-11", {
						"min-h-16 my-1 py-2": !hideSender,
					})}
				>
					<div className="flex grow flex-col gap-2">
						<TransactionRowAddressing
							transaction={transaction}
							profile={profile}
							isAdvanced
							variant="sender"
						/>
						<div className="md-lg:hidden">
							<TransactionRowAddressing
								transaction={transaction}
								profile={profile}
								isAdvanced
								variant="recipient"
							/>
						</div>
					</div>
				</TableCell>

				<TableCell
					className={cn({
						hidden: hideSender,
						"md-lg:table-cell hidden": !hideSender,
					})}
					innerClassName={cn("space-x-4 items-start px-0 lg:px-3 xl:pt-3 xl:min-h-11", {
						"min-h-16 my-1 py-2 lg:min-w-36": !hideSender,
					})}
				>
					<TransactionRowAddressing
						transaction={transaction}
						profile={profile}
						isAdvanced
						variant="recipient"
					/>
				</TableCell>

				<TableCell
					className={cn({
						hidden: !hideSender,
					})}
					innerClassName="space-x-4 items-start my-1 pt-2 px-0 lg:px-3 xl:pt-3 xl:min-h-11 min-h-14 pt-2 mt-1 lg:min-w-36"
				>
					<TransactionRowAddressing transaction={transaction} profile={profile} isAdvanced={false} />
				</TableCell>

				<TableCell
					className="hidden xl:table-cell"
					innerClassName={cn("justify-end items-start my-1 min-h-14 pt-2 xl:min-h-11 xl:my-0 xl:pt-3", {
						"lg:w-34 xl:w-auto": !hideSender,
					})}
				>
					<div className="flex flex-col items-end gap-1">
						<TransactionTotalLabel transaction={transaction} hideStyles={!hideSender} profile={profile} />
						<span
							className="text-theme-secondary-700 text-xs font-semibold lg:hidden"
							data-testid="TransactionRow__exchange-currency"
						>
							<TransactionFiatAmount
								transaction={transaction}
								exchangeCurrency={exchangeCurrency}
								profile={profile}
							/>
						</span>
					</div>
				</TableCell>

				<TableCell
					variant="end"
					innerClassName={cn(
						"justify-end items-start text-sm text-theme-secondary-900 dark:text-theme-secondary-200 font-semibold xl:min-h-11 xl:my-0 xl:pt-3",
						{
							"min-h-14 my-1 pt-2": hideSender,
							"min-h-[66px] py-1 my-0 md-lg:min-h-14 md-lg:pt-2": !hideSender,
						},
					)}
				>
					{isXl ? (
						<Amount
							value={transaction.convertedTotal()}
							ticker={exchangeCurrency || ""}
							allowHideBalance
							profile={profile}
						/>
					) : (
						<div className="flex w-40 flex-col items-end gap-1">
							<TransactionTotalLabel
								transaction={transaction}
								hideStyles={!hideSender}
								profile={profile}
							/>
							<span
								className="text-theme-secondary-700 text-xs font-semibold xl:hidden"
								data-testid="TransactionRow__exchange-currency"
							>
								<TransactionFiatAmount
									transaction={transaction}
									exchangeCurrency={exchangeCurrency}
									profile={profile}
								/>
							</span>
						</div>
					)}
				</TableCell>
			</TableRow>
		);
	},
);

TransactionRow.displayName = "TransactionRow";
