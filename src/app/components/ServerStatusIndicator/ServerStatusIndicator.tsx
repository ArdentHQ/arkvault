import React from "react";

import { Contracts } from "@ardenthq/sdk-profiles";
import { useTranslation } from "react-i18next";
import { Button } from "@/app/components/Button";
import { Dropdown } from "@/app/components/Dropdown";
import { NavigationButtonWrapper } from "@/app/components/NavigationBar/NavigationBar.blocks";
import { useServerHealthStatus } from "@/app/hooks";
import { Link } from "@/app/components/Link";
import { ServerHealthStatus } from "@/domains/setting/pages/Servers/Servers.contracts";
import { Icon } from "@/app/components/Icon";

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

	return <div className={`h-2 w-2 rounded-full ${dotColorClass()}`} />;
};

export const ServerStatusIndicator = ({ profile }: { profile: Contracts.IProfile }) => {
	const { t } = useTranslation();

	const { status } = useServerHealthStatus();

	return (
		<div>
			<Dropdown
				placement="bottom"
				toggleContent={
					<NavigationButtonWrapper className="group">
						<Button variant="transparent" size="icon" data-testid="NavigationBar__buttons--server-status">
							<Icon name="Cloud" size="lg" className="p-1" />
							<div className="absolute right-1 top-1 flex items-center justify-center rounded-full bg-theme-background p-1 transition-all duration-100 ease-linear group-hover:bg-theme-primary-100 dark:group-hover:bg-theme-secondary-800">
								<StatusDot status={status.value} />
							</div>
						</Button>
					</NavigationButtonWrapper>
				}
			>
				<div className="w-full sm:w-128">
					<div className="flex w-full items-center justify-between rounded-t-xl bg-theme-secondary-100 px-8 py-4 dark:bg-black">
						<div className="text-sm font-semibold text-theme-secondary-500">
							{t("COMMON.NETWORK_STATUS")}
						</div>
						<Link to={`/profiles/${profile.id()}/settings/servers`}>
							<span className="text-sm font-semibold">{t("COMMON.MANAGE_SERVERS")}</span>
						</Link>
					</div>
					<div className="flex items-start space-x-2 px-8 py-4 text-theme-text">
						<div className="mt-1 flex items-center justify-center rounded-full bg-theme-background p-1 transition-all duration-100 ease-linear group-hover:bg-theme-primary-100 dark:group-hover:bg-theme-secondary-800">
							<StatusDot status={status.value} />
						</div>
						<div>{status.label}</div>
					</div>
				</div>
			</Dropdown>
		</div>
	);
};
