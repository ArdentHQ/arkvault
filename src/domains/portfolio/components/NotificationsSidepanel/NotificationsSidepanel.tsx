import { SidePanel } from "@/app/components/SidePanel/SidePanel";
import { useActiveProfile } from "@/app/hooks";
import { NotificationsEmptyBlock } from "@/app/components/Notifications/NotificationsEmptyBlock";

export const NotificationsSidepanel = ({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) => {
	return (
		<SidePanel
			minimizeable={false}
			title="Notifications"
			open={open}
			onOpenChange={onOpenChange}
			dataTestId="NotificationsSidepanel"
		>
			<NotificationsEmptyBlock />
		</SidePanel>
	);
};
