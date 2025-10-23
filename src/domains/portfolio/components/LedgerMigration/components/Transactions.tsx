import React, { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import { Icon } from "@/app/components/Icon";
import cn from "classnames";
import { Divider } from "@/app/components/Divider";
import { LedgerMigrator } from "@/app/lib/mainsail/ledger.migrator";
import { TransactionTable } from "./TransactionTable";
import { useBreakpoint } from "@/app/hooks";
import { DetailLabel } from "@/app/components/DetailWrapper";
import { TransactionRowMobile } from "./TransactionRowMobile";
import { Warning, Success } from "@/app/components/AlertBanner";

export const Transactions = ({
	migrator,
	children,
	showStatusBanner
}: {
	showStatusBanner?: boolean;
	migrator: LedgerMigrator;
	children?: ReactElement
}) => {
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(true);
	const { isXs } = useBreakpoint();

	if (isXs) {
		return (
			<div className="space-y-2">
				<DetailLabel>
					<div className="flex items-center justify-between" onClick={() => setIsOpen(!isOpen)}>
						<span>{t("COMMON.ADDRESSES")}</span>
						<div className="flex items-center">
							<div className="mr-1">
								<span className="font-semibold">{migrator.currentTransactionIndex() + 1}</span> {t("COMMON.OUT_OF")}  {migrator.transactions().length}
							</div>
							<Divider type="vertical" />
							<Icon
								name="ChevronDownSmall"
								className={cn("text-theme-secondary-500 ml-1 transition-transform", {
									"rotate-180 transform": isOpen,
								})}
								size="sm"
							/>
						</div>
					</div>
				</DetailLabel>

				{isOpen && (
					<div className="p-3">
						{migrator.transactions().map((transaction, index) => (
							<TransactionRowMobile transaction={transaction} key={index} />
						))}
					</div>
				)}


				{showStatusBanner && (
					<>
						{!migrator.currentTransaction()?.signedTransaction() && migrator.currentTransaction()?.isPending() && (
							<div className="px-2"><Warning>{t("COMMON.LEDGER_MIGRATION.APPROVE_LEDGER_TRANSACTION")}</Warning></div>
						)}

						{migrator.currentTransaction()?.isPendingConfirmation() && (
							<div className="px-2"> <Warning>{t("TRANSACTION.PENDING.STATUS_TEXT")}</Warning> </div>
						)}

						{migrator.currentTransaction()?.isCompleted() && (
							<div className="px-2"> <Success>{t("COMMON.LEDGER_MIGRATION.LEDGER_TRANSACTION_CONFIRMED")}</Success> </div>
						)}
					</>
				)}
			</div>
		);
	}

	return (
		<div
			className={cn(
				"outline-theme-secondary-300 dark:border-theme-secondary-800 dark:outline-theme-secondary-800 dim:border-theme-dim-700 dim:outline-theme-dim-700 rounded-xl outline outline-1",
				{
					"pb-2": isOpen,
				},
			)}
		>
			<div
				className={cn(
					"border-b-theme-secondary-300 dark:border-b-theme-secondary-800 dim:border-b-theme-dim-700 flex w-full cursor-pointer items-center justify-between gap-3 px-6 py-4 pt-3 pb-4",
					{
						"border-b": isOpen,
					},
				)}
				onClick={() => setIsOpen(!isOpen)}
			>
				<div className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-200 text-base leading-5 font-semibold">
					{t("COMMON.ADDRESSES")}
				</div>
				<div className="flex items-center">
					<div className="mr-1">
						<span className="font-semibold">{migrator.currentTransactionIndex() + 1}</span> {t("COMMON.OUT_OF")}  {migrator.transactions().length}
					</div>
					<Divider type="vertical" />
					<Icon
						name="ChevronDownSmall"
						className={cn("text-theme-secondary-500 ml-1 transition-transform", {
							"rotate-180 transform": isOpen,
						})}
						size="sm"
					/>
				</div>
			</div>

			{isOpen && <TransactionTable transactions={migrator.transactions()} />}

			{showStatusBanner && (
				<>
					{!migrator.currentTransaction()?.signedTransaction() && migrator.currentTransaction()?.isPending() && (
						<div className="px-2"><Warning>{t("COMMON.LEDGER_MIGRATION.APPROVE_LEDGER_TRANSACTION")}</Warning></div>
					)}

					{migrator.currentTransaction()?.isPendingConfirmation() && (
						<div className="px-2"> <Warning>{t("TRANSACTION.PENDING.STATUS_TEXT")}</Warning> </div>
					)}

					{migrator.currentTransaction()?.isCompleted() && (
						<div className="px-2"> <Success>{t("COMMON.LEDGER_MIGRATION.LEDGER_TRANSACTION_CONFIRMED")}</Success> </div>
					)}
				</>
			)}
		</div>
	);
};
