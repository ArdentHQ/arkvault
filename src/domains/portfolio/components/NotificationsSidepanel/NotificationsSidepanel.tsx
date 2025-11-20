import { SidePanel } from "@/app/components/SidePanel/SidePanel";
import { Notifications } from "./Notification.blocks";
import { useActiveProfile } from "@/app/hooks";

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
