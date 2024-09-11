import React, { memo } from "react";
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
		const { isXs, isSm } = useBreakpoint();
		const { t } = useTranslation();
		const timeFormat = useTimeFormat();

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

		return (
			<TableRow onClick={onClick} className={className} {...properties}>
				<TableCell variant="start">
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
					className="table-cell md:hidden lg:table-cell"
				>
					<span data-testid="TransactionRow__timestamp" className="whitespace-nowrap">
						{transaction.timestamp()!.format(timeFormat)}
					</span>
				</TableCell>

				<TableCell innerClassName="space-x-4">
					<TransactionRowSender transaction={transaction} profile={profile} />
				</TableCell>

				<TableCell innerClassName="space-x-4">
					<TransactionRowRecipient transaction={transaction} profile={profile} />
				</TableCell>

				<TableCell innerClassName="justify-end">
					<TransactionRowAmount
						transaction={transaction}
						exchangeCurrency={exchangeCurrency}
						exchangeTooltip
					/>
				</TableCell>

				<TableCell variant="end" className="hidden xl:block" innerClassName="justify-end">
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
