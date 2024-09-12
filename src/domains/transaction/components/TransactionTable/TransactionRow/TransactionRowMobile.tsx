import cn from "classnames";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";

import { TransactionRowAmount } from "./TransactionRowAmount";
import { TransactionRowRecipient } from "./TransactionRowRecipient";
import { TransactionRowSender } from "./TransactionRowSender";
import { TransactionRowMobileSkeleton } from "./TransactionRowMobileSkeleton";
import { TransactionRowProperties } from "./TransactionRow.contracts";
import { Avatar } from "@/app/components/Avatar";
import { Link } from "@/app/components/Link";
import { TableRow } from "@/app/components/Table";
import { useTimeFormat } from "@/app/hooks/use-time-format";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { RowWrapper, RowLabel, ResponsiveAddressWrapper } from "@/app/components/Table/Mobile/Row";

export const TransactionRowMobile = memo(
	({
		className,
		exchangeCurrency,
		transaction,
		onClick,
		isLoading = false,
		profile,
		...properties
	}: TransactionRowProperties) => {
		const { t } = useTranslation();
		const timeFormat = useTimeFormat();

		if (isLoading) {
			return <TransactionRowMobileSkeleton />;
		}

		return (
			<TableRow onClick={onClick} className={cn("group", className)} {...properties}>
				<td data-testid="TableRow__mobile" className="flex-col space-y-4 py-4">
					<RowWrapper>
						<RowLabel>{t("COMMON.ID")}</RowLabel>
						<Link
							to={transaction.explorerLink()}
							tooltip={transaction.id()}
							showExternalIcon={false}
							isExternal
						>
							<TruncateMiddle text={transaction.id()} />
						</Link>
					</RowWrapper>

					<RowWrapper>
						<RowLabel>{t("COMMON.DATE")}</RowLabel>
						<div
							data-testid="TransactionRow__timestamp"
							className="whitespace-nowrap text-theme-secondary-text"
						>
							{transaction.timestamp()!.format(timeFormat)}
						</div>
					</RowWrapper>

					<RowWrapper>
						<RowLabel>{t("COMMON.SENDER")}</RowLabel>
						<ResponsiveAddressWrapper innerClassName="gap-2">
							<TransactionRowSender
								transaction={transaction}
								profile={profile}
								showTransactionMode={false}
							/>

							<Avatar size="xs" address={transaction.sender()} noShadow />
						</ResponsiveAddressWrapper>
					</RowWrapper>

					<RowWrapper>
						<RowLabel>{t("COMMON.RECIPIENT")}</RowLabel>
						<ResponsiveAddressWrapper innerClassName="flex-row-reverse gap-2">
							<TransactionRowRecipient transaction={transaction} profile={profile} />
						</ResponsiveAddressWrapper>
					</RowWrapper>

					<RowWrapper>
						<RowLabel>{t("COMMON.AMOUNT")}</RowLabel>

						<TransactionRowAmount
							transaction={transaction}
							exchangeCurrency={exchangeCurrency}
							exchangeTooltip
							isCompact={false}
						/>
					</RowWrapper>

					<RowWrapper>
						<RowLabel>{t("COMMON.CURRENCY")}</RowLabel>

						<div className="flex flex-col justify-end">
							{!exchangeCurrency || transaction.wallet().network().isTest() ? (
								<span data-testid="TransactionRow__currency" className="whitespace-nowrap">
									{t("COMMON.NOT_AVAILABLE")}
								</span>
							) : (
								<span data-testid="TransactionRow__currency" className="whitespace-nowrap">
									<TransactionRowAmount
										transaction={transaction}
										exchangeCurrency={exchangeCurrency}
									/>
								</span>
							)}
						</div>
					</RowWrapper>
				</td>
			</TableRow>
		);
	},
);

TransactionRowMobile.displayName = "TransactionRowMobile";
