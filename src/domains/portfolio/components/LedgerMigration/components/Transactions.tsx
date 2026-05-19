import React, { useState } from "react";
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
	showStatusBanner,
}: {
	showStatusBanner?: boolean;
	migrator: LedgerMigrator;
}) => {
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(true);
	const { isXs } = useBreakpoint();

	if (isXs) {
		return (
			<div className="space-y-2">
				<DetailLabel>
					<div
						data-testid="TransactionTableToggleMobile"
						className="flex items-center justify-between"
						onClick={() => setIsOpen(!isOpen)}
					>
						<span>{t("COMMON.ADDRESSES")}</span>
						<div className="flex items-center">
							<div className="mr-1">
								<span className="font-semibold">{migrator.currentTransactionIndex() + 1}</span>{" "}
								{t("COMMON.OUT_OF")} {migrator.transactions().length}
							</div>
							<Divider type="vertical" />
							<Icon
								name="ChevronDownSmall"
								className={cn("ml-1 text-theme-secondary-500 transition-transform", {
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
						{!migrator.currentTransaction()?.signedTransaction() &&
							migrator.currentTransaction()?.isPending() && (
								<div className="px-2">
									<Warning>{t("COMMON.LEDGER_MIGRATION.APPROVE_LEDGER_TRANSACTION")}</Warning>
								</div>
							)}

						{migrator.currentTransaction()?.isPendingConfirmation() && (
							<div className="px-2">
								{" "}
								<Warning>{t("TRANSACTION.PENDING.STATUS_TEXT")}</Warning>{" "}
							</div>
						)}

						{migrator.currentTransaction()?.isCompleted() && (
							<div className="px-2">
								{" "}
								<Success>{t("COMMON.LEDGER_MIGRATION.LEDGER_TRANSACTION_CONFIRMED")}</Success>{" "}
							</div>
						)}
					</>
				)}
			</div>
		);
	}

	return (
		<div
			className={cn(
				"rounded-xl outline outline-1 outline-theme-secondary-300 dim:border-theme-dim-700 dim:outline-theme-dim-700 dark:border-theme-secondary-800 dark:outline-theme-secondary-800",
			)}
		>
			<div
				data-testid="TransactionTableToggle"
				className={cn(
					"flex w-full cursor-pointer items-center justify-between gap-3 border-b-theme-secondary-300 px-6 py-4 pb-4 pt-3 dim:border-b-theme-dim-700 dark:border-b-theme-secondary-800",
					{
						"border-b": isOpen,
					},
				)}
				onClick={() => setIsOpen(!isOpen)}
			>
				<div className="text-base font-semibold leading-5 text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-secondary-500">
					{t("COMMON.ADDRESSES")}
				</div>
				<div className="flex items-center">
					<div className="mr-1">
						<span className="font-semibold">{migrator.currentTransactionIndex() + 1}</span>{" "}
						{t("COMMON.OUT_OF")} {migrator.transactions().length}
					</div>
					<Divider type="vertical" />
					<Icon
						name="ChevronDownSmall"
						className={cn("ml-1 text-theme-secondary-500 transition-transform", {
							"rotate-180 transform": isOpen,
						})}
						size="sm"
					/>
				</div>
			</div>

			{isOpen && <TransactionTable transactions={migrator.transactions()} />}

			{showStatusBanner && (
				<div className={cn("pb-2", { "pt-2": isOpen })}>
					{!migrator.currentTransaction()?.signedTransaction() &&
						migrator.currentTransaction()?.isPending() && (
							<div className="px-2">
								<Warning>{t("COMMON.LEDGER_MIGRATION.APPROVE_LEDGER_TRANSACTION")}</Warning>
							</div>
						)}

					{migrator.currentTransaction()?.isPendingConfirmation() && (
						<div className="px-2">
							{" "}
							<Warning>{t("TRANSACTION.PENDING.STATUS_TEXT")}</Warning>{" "}
						</div>
					)}

					{migrator.currentTransaction()?.isCompleted() && (
						<div className="px-2">
							{" "}
							<Success>{t("COMMON.LEDGER_MIGRATION.LEDGER_TRANSACTION_CONFIRMED")}</Success>{" "}
						</div>
					)}
				</div>
			)}
		</div>
	);
};
