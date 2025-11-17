import { SidePanel } from "@/app/components/SidePanel/SidePanel";
import { Notifications } from "@/app/components/Notifications";
import { useActiveProfile } from "@/app/hooks";
import { WalletSelection } from "@/app/components/Notifications/WalletSelection/WalletSelection";

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
			<WalletSelection profile={activeProfile} />
		</SidePanel>
	);
};
