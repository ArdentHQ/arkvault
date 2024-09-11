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

export const TransactionRow = memo(
	({
		className,
		exchangeCurrency,
		transaction,
		onClick,
		isLoading = false,
		profile,
		currency,
		convertedBalance,
		...properties
	}: TransactionRowProperties) => {
		const { isXs, isSm, isMd } = useBreakpoint();
		const { getLabel } = useTransactionTypes();
		const { t } = useTranslation();
		const timeStamp = transaction.timestamp ? transaction.timestamp() : undefined;

		const isCompact = useMemo(
			() => !profile.appearance().get("useExpandedTables") || isSm || isXs || isMd,
			[profile, isMd, isSm, isXs],
		);

		if (isXs || isSm) {
			return (
				<TransactionRowMobile
					isLoading={isLoading}
					onClick={onClick}
					transaction={transaction}
					exchangeCurrency={exchangeCurrency}
					profile={profile}
					currency={currency}
					convertedBalance={convertedBalance}
				/>
			);
		}

		if (isLoading) {
			return <TransactionRowSkeleton isCompact={isCompact} />;
		}

		return (
			<TableRow onClick={onClick} className={twMerge("relative", className)} {...properties}>
				<TableCell variant="start" isCompact={isCompact} innerClassName="items-start my-0 py-3 xl:min-h-0">
					<div className="flex flex-col gap-1 font-semibold">
						<Link
							to={transaction.explorerLink()}
							tooltip={transaction.id()}
							showExternalIcon={false}
							isExternal
						>
							<span className="text-sm">
								<TruncateMiddle
									className="cursor-pointer text-theme-primary-600"
									text={transaction.id()}
									maxChars={14}
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
					className="hidden lg:table-cell"
					innerClassName="text-sm text-theme-secondary-900 dark:text-theme-secondary-200 font-semibold items-start xl:min-h-0 my-0 py-3"
					isCompact={isCompact}
				>
					{timeStamp ? (
						<TimeAgo date={DateTime.fromUnix(timeStamp.toUNIX()).toISOString()} />
					) : (
						t("COMMON.NOT_AVAILABLE")
					)}
				</TableCell>

				<TableCell isCompact={isCompact} innerClassName="items-start xl:min-h-0 my-0 py-3">
					<Label color="secondary" size="xs" noBorder className="rounded p-1">
						{getLabel(transaction.type())}
					</Label>
				</TableCell>

				<TableCell innerClassName="space-x-4" isCompact={isCompact}>
					<TransactionRowAddressing transaction={transaction} profile={profile} />
				</TableCell>

				<TableCell isCompact={isCompact} innerClassName="justify-end items-start xl:min-h-0 my-0 py-3">
					<div className="flex flex-col items-end gap-1">
						<AmountLabel
							value={transaction.amount() + transaction.fee()}
							isNegative={true}
							ticker={currency}
							isCompact
						/>
						<span className="text-xs font-semibold text-theme-secondary-700 lg:hidden">
							<Amount value={convertedBalance} ticker={exchangeCurrency || ""} />
						</span>
					</div>
				</TableCell>

				<TableCell
					isCompact={isCompact}
					className="hidden lg:table-cell"
					innerClassName="justify-end items-start text-sm text-theme-secondary-900 dark:text-theme-secondary-200 font-semibold xl:min-h-0 my-0 py-3"
				>
					<Amount value={convertedBalance} ticker={exchangeCurrency || ""} />
				</TableCell>



				{/* <TableCell
					innerClassName="text-theme-secondary-text"
					isCompact={isCompact}
					className="table-cell md:hidden lg:table-cell"
				>
					<span data-testid="TransactionRow__timestamp" className="whitespace-nowrap">
						{transaction.timestamp()!.format(timeFormat)}
					</span>
				</TableCell>

				<TableCell innerClassName="space-x-4" isCompact={isCompact}>
					<TransactionRowSender transaction={transaction} profile={profile} isCompact={isCompact} />
				</TableCell>

				<TableCell innerClassName="space-x-4" isCompact={isCompact}>
					<TransactionRowRecipient transaction={transaction} profile={profile} isCompact={isCompact} />
				</TableCell>

				<TableCell innerClassName="justify-end" isCompact={isCompact}>
					<TransactionRowAmount
						transaction={transaction}
						exchangeCurrency={exchangeCurrency}
						exchangeTooltip
						isCompact={isCompact}
					/>
				</TableCell>

				<TableCell variant="end" className="hidden xl:block" innerClassName="justify-end" isCompact={isCompact}>
					{!exchangeCurrency || transaction.wallet().network().isTest() ? (
						<span
							data-testid="TransactionRow__currency"
							className="whitespace-nowrap text-theme-secondary-text"
						>
							{t("COMMON.NOT_AVAILABLE")}
						</span>
					) : (
						<span data-testid="TransactionRow__currency" className="whitespace-nowrap">
							<TransactionRowAmount transaction={transaction} exchangeCurrency={exchangeCurrency} />
						</span>
					)}
				</TableCell> */}
			</TableRow>
		);
	},
);

TransactionRow.displayName = "TransactionRow";
