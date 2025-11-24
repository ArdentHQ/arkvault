import { SidePanel } from "@/app/components/SidePanel/SidePanel";
import { Notifications } from "./Notification.blocks";
import { useActiveProfile } from "@/app/hooks";
import { TransactionDetailContent } from "@/domains/transaction/components/TransactionDetailSidePanel";
import { useState } from "react";
import { ExtendedTransactionDTO } from "@/domains/transaction/components/TransactionTable";
import { useTranslation } from "react-i18next";
import { Button } from "@/app/components/Button";
import { SIDE_PANEL_TRANSITION_DURATION } from "@/app/contexts";

export const NotificationsSidepanel = ({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) => {
	const { t } = useTranslation();
	const activeProfile = useActiveProfile();
	const [transactionModalItem, setTransactionModalItem] = useState<ExtendedTransactionDTO | undefined>(undefined);
	const title = transactionModalItem
		? t("TRANSACTION.MODAL_TRANSACTION_DETAILS.TITLE")
		: t("COMMON.NOTIFICATIONS.TITLE");

	return (
		<div>
			<SidePanel
				minimizeable={false}
				title={title}
				open={open}
				onOpenChange={(isOpen) => {
					onOpenChange(isOpen);

					if (open) {
						setTimeout(() => {
							setTransactionModalItem(undefined);
						}, SIDE_PANEL_TRANSITION_DURATION);
					}
				}}
				dataTestId="NotificationsSidepanel"
				footer={
					transactionModalItem ? (
						<div className="flex items-center justify-end">
							<Button
								data-testid="ExchangeForm__back-button"
								variant="secondary"
								onClick={() => setTransactionModalItem(undefined)}
							>
								{t("COMMON.BACK")}
							</Button>
						</div>
					) : undefined
				}
			>
				{!transactionModalItem && (
					<Notifications
						profile={activeProfile}
						onViewTransactionDetails={(transaction) => setTransactionModalItem(transaction)}
					/>
				)}

				{transactionModalItem && (
					<TransactionDetailContent
						transactionItem={transactionModalItem}
						profile={activeProfile}
						isConfirmed={transactionModalItem.isConfirmed()}
						confirmations={transactionModalItem.confirmations().toNumber()}
						allowHideBalance
						containerClassname="-mx-3 sm:mx-0"
					/>
				)}
			</SidePanel>
		</div>
	);
};
