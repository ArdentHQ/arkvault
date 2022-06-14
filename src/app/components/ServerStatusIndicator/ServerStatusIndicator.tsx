import React from "react";

import { Contracts } from "@ardenthq/sdk-profiles";
import { Button } from "@/app/components/Button";
import { Dropdown } from "@/app/components/Dropdown";
import { NavigationButtonWrapper } from "@/app/components/NavigationBar/NavigationBar.blocks";
import { useBreakpoint, useServerHealthStatus } from "@/app/hooks";
import { Link } from "@/app/components/Link";
import { ServerHealthStatus } from "@/domains/setting/pages/Servers/Servers.contracts";

const StatusDot = ({ status }: { status: ServerHealthStatus }) => {
	const dotColorClass = () => {
		if (status === ServerHealthStatus.Healthy) {
			return "bg-theme-success-700";
		}

		if (status === ServerHealthStatus.Downgraded) {
			return "bg-theme-warning-600";
		}

		if (status === ServerHealthStatus.Unavailable) {
			return "bg-theme-danger-500";
		}

		return "bg-theme-gray-100";
	};

	return (
		<div className="flex items-center justify-center rounded-full bg-theme-background p-1 transition-all duration-100 ease-linear group-hover:bg-theme-primary-100 dark:group-hover:bg-theme-secondary-800">
			<div className={`h-2 w-2 rounded-full ${dotColorClass()}`} />
		</div>
	);
};

export const ServerStatusIndicator = ({ profile }: { profile: Contracts.IProfile }) => {
	const { isSm, isMd } = useBreakpoint();
	const { status } = useServerHealthStatus();

	return (
		<div>
			<Dropdown
				position={isSm || isMd ? "top-center" : "right"}
				dropdownClass="mt-8 mx-4 sm:mx-0 border-none"
				toggleContent={
					<NavigationButtonWrapper className="group">
						<Button variant="transparent" size="icon" data-testid="NavigationBar__buttons--server-status">
							<StatusDot status={status.value} />
						</Button>
					</NavigationButtonWrapper>
				}
			>
				<div className="-mt-3 flex w-full items-center justify-between rounded-t-xl bg-theme-secondary-100 px-8 py-4 dark:bg-black sm:w-128">
					<div className="text-sm font-semibold text-theme-secondary-500">Network Status</div>
					<Link to={`/profiles/${profile.id()}/settings/servers`}>
						<span className="text-sm font-semibold">Manage Servers</span>
					</Link>
				</div>
				<div className="flex items-start space-x-2 px-8 pt-4 pb-2">
					<div className="mt-1">
						<StatusDot status={status.value} />
					</div>
					<div>{status.label}</div>
				</div>
			</Dropdown>
		</div>
	);
};
