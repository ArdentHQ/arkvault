import { SidePanel } from "@/app/components/SidePanel/SidePanel";
import { useNotifications } from "@/app/components/Notifications";
import { useActiveProfile } from "@/app/hooks";
import { Notification } from "@/domains/portfolio/components/NotificationsSidepanel/Notification.blocks";

export const NotificationsSidepanel = ({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) => {
	const activeProfile = useActiveProfile();

	// const { persist } = useEnvironmentContext();

	const { transactions, isNotificationUnread } = useNotifications({ profile: activeProfile });

	console.log(transactions);
	// useEffect(() => {
	// 	markAllTransactionsAsRead(true);
	// 	persist();
	// }, []);

	return (
		<SidePanel
			minimizeable={false}
			title="Notifications"
			open={open}
			onOpenChange={onOpenChange}
			// open={true}
			dataTestId="NotificationsSidepanel"
		>
			<div className="space-y-1">
				{transactions.map((transaction) => (
					<Notification transaction={transaction} isRead={isNotificationUnread(transaction)} />
				))}
			</div>
		</SidePanel>
	);
};
