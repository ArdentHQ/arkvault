import cn from "classnames";
import React, { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { TransactionRowAmount } from "./TransactionRowAmount";
import { TransactionRowRecipient } from "./TransactionRowRecipient";
import { TransactionRowSender } from "./TransactionRowSender";
import { TransactionRowSkeleton } from "./TransactionRowSkeleton";
import { TransactionRowProperties } from "./TransactionRow.contracts";
import { TransactionRowMobile } from "./TransactionRowMobile";
import { Icon } from "@/app/components/Icon";
import { Link } from "@/app/components/Link";
import { TableCell, TableRow } from "@/app/components/Table";
import { useTimeFormat } from "@/app/hooks/use-time-format";
import { useBreakpoint } from "@/app/hooks";
import { useTransaction } from "@/domains/transaction/hooks";
import { TransactionRowMigrationDetails } from "./TransactionRowMigrationDetails";

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
		const { isXs, isSm, isMd } = useBreakpoint();
		const { t } = useTranslation();
		const timeFormat = useTimeFormat();
		const { isMigrationTransaction } = useTransaction();

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
				/>
			);
		}

		if (isLoading) {
			return <TransactionRowSkeleton isCompact={isCompact} />;
		}

		return (
			<TableRow onClick={onClick} className={cn("group", className)} {...properties}>
				<TableCell variant="start" isCompact={isCompact}>
					<Link
						to={transaction.explorerLink()}
						tooltip={transaction.id()}
						showExternalIcon={false}
						isExternal
					>
						<Icon name="MagnifyingGlassId" />
					</Link>
				</TableCell>

				<TableCell
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
					{!isMigrationTransaction(transaction) && (
						<TransactionRowRecipient transaction={transaction} profile={profile} isCompact={isCompact} />
					)}

					{isMigrationTransaction(transaction) && (
						<TransactionRowMigrationDetails transaction={transaction} isCompact={isCompact} />
					)}
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
				</TableCell>
			</TableRow>
		);
	},
);

TransactionRow.displayName = "TransactionRow";
