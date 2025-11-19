import { SidePanel } from "@/app/components/SidePanel/SidePanel";
import { useActiveProfile } from "@/app/hooks";
import { Notifications } from "@/domains/portfolio/components/NotificationsSidepanel/Notification.blocks";

export const NotificationsSidepanel = ({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) => {
	const activeProfile = useActiveProfile();

	return (
		<SidePanel
			minimizeable={false}
			title="Notifications"
			open={open}
			onOpenChange={onOpenChange}
			dataTestId="NotificationsSidepanel"
		>
      <Notifications profile={activeProfile} />
		</SidePanel>
	);
};
