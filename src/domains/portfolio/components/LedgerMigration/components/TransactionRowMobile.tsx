import React from "react";
import { useTranslation } from "react-i18next";
import { TableRow } from "@/app/components/Table";
import { MobileCard } from "@/app/components/Table/Mobile/MobileCard";
import { MobileSection } from "@/app/components/Table/Mobile/MobileSection";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { labelBackgroundClasses, TransactionConfirmationStatusLabel } from "./TransactionConfirmationStatusLabel";
import { Link } from "@/app/components/Link";
import cn from "classnames";
import { DraftTransfer } from "@/app/lib/mainsail/draft-transfer";

export const labelBorderClasses = ({ isCompleted, isPending }: { isCompleted?: boolean, isPending?: boolean }) => cn({
	"border border-theme-warning-200 dim:border-theme-dim-700 dark:border-theme-dark-700": isPending,
	"border dim:border-theme-success-900 border-theme-success-300 dark:border-theme-success-900": isCompleted,
	"dim:border-theme-dim-700 border border-theme-secondary-300 dark:border-theme-dark-700": !isCompleted && !isPending
})

export const TransactionRowMobile = ({ transaction }: { transaction: DraftTransfer }) => {
	const { t } = useTranslation();

	return (
		<TableRow className="group border-b-0!">
			<td>
				<MobileCard className={cn("mb-3", labelBorderClasses({
					isCompleted: transaction.isCompleted(),
					isPending: transaction.isPending(),
				}))}>
					<div className={cn("flex h-10 w-full items-center justify-between px-4", labelBackgroundClasses({
						isCompleted: transaction.isCompleted(),
						isPending: transaction.isPending(),
					}))}>
						<div className="max-w-32">
							<TruncateMiddle
								className="font-semibold text-sm"
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
						<MobileSection
							title={t("COMMON.NEW")}
							className="w-full">
							<TruncateMiddle
								className="font-semibold text-sm"
								text={transaction.recipient()?.address()!}
								maxChars={14} />
						</MobileSection>

						<MobileSection
							title={t("COMMON.TX_ID")}
							className="w-full">
							<Link to={transaction.signedTransaction()?.explorerLink()!} isExternal>
								{t("COMMON.VIEW")}
							</Link>
						</MobileSection>
					</div>
				</MobileCard>
			</td>
		</TableRow>
	);
};
