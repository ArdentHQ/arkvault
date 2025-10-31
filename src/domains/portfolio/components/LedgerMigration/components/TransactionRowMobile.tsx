import React from "react";
import { useTranslation } from "react-i18next";
import { MobileCard } from "@/app/components/Table/Mobile/MobileCard";
import { MobileSection } from "@/app/components/Table/Mobile/MobileSection";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { TransactionConfirmationStatusLabel } from "./TransactionConfirmationStatusLabel";
import { Link } from "@/app/components/Link";
import cn from "classnames";
import { DraftTransfer } from "@/app/lib/mainsail/draft-transfer";

export const TransactionRowMobile = ({ transaction }: { transaction: DraftTransfer }) => {
	const { t } = useTranslation();

	return (
		<MobileCard
			data-testid="TransactionRowMobile"
			className={cn(
				"mb-3",
				cn({
					"border-theme-warning-200 dim:border-theme-warning-700 dark:border-theme-warning-700 border":
						transaction.isPending(),
					"dim:border-theme-dim-700 border-theme-secondary-300 dark:border-theme-dark-700 border":
						!transaction.isCompleted() && !transaction.isPending(),
					"dim:border-theme-success-700 border-theme-success-300 dark:border-theme-success-700 border":
						transaction.isCompleted(),
				}),
			)}
		>
			<div
				className={cn(
					"dim:bg-theme-dim-950 dark:bg-theme-dark-950 flex h-10 w-full items-center justify-between px-4",
					cn({
						"bg-theme-secondary-200": !transaction.isCompleted() && !transaction.isPending(),
						"bg-theme-success-100": transaction.isCompleted(),
						"bg-theme-warning-50": transaction.isPending(),
					}),
				)}
			>
				<div className="max-w-32">
					<TruncateMiddle
						className="text-sm font-semibold"
						text={transaction.sender().address()}
						maxChars={14}
					/>
				</div>
				<div className="flex flex-row items-center">
					<span className="text-theme-secondary-700 dim:text-theme-dim-200 text-sm font-semibold sm:block">
						<TransactionConfirmationStatusLabel
							isCompleted={transaction.isCompleted()}
							isPending={transaction.isPending()}
							className="border-transparent"
						/>
					</span>
				</div>
			</div>

			<div className="flex w-full flex-col gap-4 px-4 pt-3 pb-4 sm:grid sm:grid-cols-[200px_auto_130px] sm:pb-4">
				<MobileSection title={t("COMMON.NEW")} className="w-full">
					<TruncateMiddle
						className="text-sm font-semibold"
						text={transaction.recipient()?.address()!}
						maxChars={14}
					/>
				</MobileSection>

				{transaction.isCompleted() && (
					<MobileSection title={t("COMMON.TX_ID")} className="w-full">
						<Link to={transaction.signedTransaction()?.explorerLink()!} isExternal>
							{t("COMMON.VIEW")}
						</Link>
					</MobileSection>
				)}
			</div>
		</MobileCard>
	);
};
