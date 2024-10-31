import React, { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { TransactionRowSkeleton } from "./TransactionRowSkeleton";
import { TransactionRowProperties } from "./TransactionRow.contracts";
import { TransactionRowMobile } from "./TransactionRowMobile";
import { Link } from "@/app/components/Link";
import { TableCell, TableRow } from "@/app/components/Table";
import { useBreakpoint } from "@/app/hooks";
import { twMerge } from "tailwind-merge";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { TimeAgo } from "@/app/components/TimeAgo";
import { DateTime } from "@ardenthq/sdk-intl";
import { Label } from "@/app/components/Label";
import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";
import { TransactionRowAddressing } from "./TransactionRowAddressing";
import { Amount, AmountLabel } from "@/app/components/Amount";
import {DTO} from "@ardenthq/sdk-profiles";
import {useExchangeRate} from "@/app/hooks/use-exchange-rate";

export const calculateReturnedAmount = function (transaction: DTO.ExtendedConfirmedTransactionData): number {
	let returnedAmount = 0;

	if (!transaction.isMultiPayment()) {
		return returnedAmount;
	}

	for (const recipient of transaction.recipients().values()) {
		if (transaction.isReturn() && transaction.sender() === recipient.address) {
			returnedAmount += recipient.amount;
		}
	}

	return returnedAmount;
}

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
		const { isXs, isSm } = useBreakpoint();
		const { t } = useTranslation();

		const currency = transaction.wallet ? transaction.wallet().currency() : undefined;
		const { convert } = useExchangeRate({ exchangeTicker: exchangeCurrency, ticker: currency });

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

		const returnedAmount = calculateReturnedAmount(transaction);

		const hint = returnedAmount ? t("TRANSACTION.HINT_AMOUNT_EXCLUDING", { amount: returnedAmount, currency }) : undefined;

		const amount = transaction.total() - returnedAmount;

		return (
			<TableRow onClick={onClick} className={twMerge("relative", className)} {...properties}>
				<TableCell variant="start" innerClassName="items-start my-0 py-3 xl:min-h-0">
					<div className="flex flex-col gap-1 font-semibold">
						<Link to={transaction.explorerLink()} showExternalIcon={false} isExternal>
							<span className="text-sm">
								<TruncateMiddle
									className="cursor-pointer text-theme-primary-600"
									text={transaction.id()}
									maxChars={14}
									data-testid="TransactionRow__id"
								/>
							</span>
						</Link>
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
					innerClassName="text-sm text-theme-secondary-900 dark:text-theme-secondary-200 font-semibold items-start xl:min-h-0 my-0 py-3"
					data-testid="TransactionRow__timestamp"
				>
					{timeStamp ? (
						<TimeAgo date={DateTime.fromUnix(timeStamp.toUNIX()).toISOString()} />
					) : (
						t("COMMON.NOT_AVAILABLE")
					)}
				</TableCell>

				<TableCell innerClassName="items-start xl:min-h-0 my-0 py-3">
					<Label
						color="secondary"
						size="xs"
						noBorder
						className="rounded px-1 dark:border"
						data-testid="TransactionRow__type"
					>
						{getLabel(transaction.type())}
					</Label>
				</TableCell>

				<TableCell innerClassName="space-x-4">
					<TransactionRowAddressing transaction={transaction} profile={profile} />
				</TableCell>

				<TableCell innerClassName="justify-end items-start xl:min-h-0 my-0 py-3">
					<div className="flex flex-col items-end gap-1">
						<AmountLabel
							value={amount}
							isNegative={transaction.isSent()}
							ticker={transaction.wallet().currency()}
							hideSign={transaction.isTransfer() && transaction.sender() === transaction.recipient()}
							isCompact
							hint={hint}
							className="h-[21px] rounded dark:border"
						/>
						<span
							className="text-xs font-semibold text-theme-secondary-700 lg:hidden"
							data-testid="TransactionRow__exchange-currency"
						>
							<Amount value={convert(amount)} ticker={exchangeCurrency || ""} />
						</span>
					</div>
				</TableCell>

				<TableCell
					className="hidden lg:table-cell"
					variant="end"
					innerClassName="justify-end items-start text-sm text-theme-secondary-900 dark:text-theme-secondary-200 font-semibold xl:min-h-0 my-0 py-3"
				>
					<Amount value={transaction.convertedTotal()} ticker={exchangeCurrency || ""} />
				</TableCell>
			</TableRow>
		);
	},
);

TransactionRow.displayName = "TransactionRow";
