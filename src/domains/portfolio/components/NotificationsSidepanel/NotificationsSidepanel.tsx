import { SidePanel } from "@/app/components/SidePanel/SidePanel";
import { Notifications } from "./Notification.blocks";
import { useActiveProfile } from "@/app/hooks";
import { TransactionDetailSidePanel } from "@/domains/transaction/components/TransactionDetailSidePanel";
import { useState } from "react";
import { ExtendedTransactionDTO } from "@/domains/transaction/components/TransactionTable";

export const NotificationsSidepanel = ({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) => {
	const activeProfile = useActiveProfile();
	const [transactionModalItem, setTransactionModalItem] = useState<ExtendedTransactionDTO | undefined>(undefined);

	return (
		<div>
			<SidePanel
				minimizeable={false}
				title="Notifications"
				open={open}
				onOpenChange={(isOpen) => {
					if (transactionModalItem) {
						return;
					}

					onOpenChange(isOpen);
				}}
				dataTestId="NotificationsSidepanel"
			>
				<Notifications
					profile={activeProfile}
					onViewTransactionDetails={(transaction) => setTransactionModalItem(transaction)}
				/>
			</SidePanel>

			{transactionModalItem && (
				<TransactionDetailSidePanel
					minimizeable={false}
					isOpen
					transactionItem={transactionModalItem}
					profile={activeProfile}
					onClose={() => {
						setTransactionModalItem(undefined);
					}}
				/>
			)}
		</div>
	);
};
