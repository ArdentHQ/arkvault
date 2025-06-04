import React from "react";

import { Contracts } from "@/app/lib/profiles";
import { useTranslation } from "react-i18next";
import { Button } from "@/app/components/Button";
import { Dropdown } from "@/app/components/Dropdown";
import { NavigationButtonWrapper } from "@/app/components/NavigationBar/NavigationBar.blocks";
import { useServerHealthStatus } from "@/app/hooks";
import { Link } from "@/app/components/Link";
import { ServerHealthStatus } from "@/domains/setting/pages/Servers/Servers.contracts";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";
const StatusDot = ({ status }: { status: ServerHealthStatus }) => {
	const dotColorClass = () => {
		if (status === ServerHealthStatus.Healthy) {
			return "bg-theme-success-600 dark:bg-theme-success-500";
		}

		if (status === ServerHealthStatus.Downgraded) {
			return "bg-theme-warning-600";
		}

		if (status === ServerHealthStatus.Unavailable) {
			return "bg-theme-danger-500";
		}

		return "bg-theme-gray-100";
	};

	return <div className={`h-1.5 w-1.5 rounded-full ${dotColorClass()}`} />;
};

export const ServerStatusIndicator = ({ profile }: { profile: Contracts.IProfile }) => {
	const { t } = useTranslation();

	const { status } = useServerHealthStatus();

	return (
		<div>
			<Dropdown
				wrapperClass="mt-2"
				placement="bottom"
				toggleContent={
					<NavigationButtonWrapper className="group">
						<Tooltip content={t("COMMON.NETWORK_STATUS")}>
							<Button
								variant="transparent"
								size="icon"
								data-testid="NavigationBar__buttons--server-status"
								className="text-theme-secondary-700 dark:text-theme-dark-200 dark:hover:text-theme-dark-50 hover:text-theme-primary-700"
							>
								<Icon name="Cloud" size="lg" className="m-0 p-1" />
								<div className="absolute top-0 right-0 flex items-center justify-center rounded-full p-1 transition-all duration-100 ease-linear">
									<StatusDot status={status.value} />
								</div>
							</Button>
						</Tooltip>
					</NavigationButtonWrapper>
				}
			>
				<div className="w-full sm:w-128">
					<div className="bg-theme-secondary-100 dim:bg-theme-dim-950 flex w-full items-center justify-between rounded-t-xl px-8 py-4 dark:bg-black">
						<div className="text-theme-secondary-500 dim:text-theme-dim-200 text-sm font-semibold">
							{t("COMMON.NETWORK_STATUS")}
						</div>
						<Link to={`/profiles/${profile.id()}/settings/servers`}>
							<span className="text-sm font-semibold">{t("COMMON.MANAGE_SERVERS")}</span>
						</Link>
					</div>
					<div className="text-theme-text flex items-start space-x-2 px-8 py-4">
						<div className="bg-theme-background dark:group-hover:bg-theme-secondary-800 group-hover:bg-theme-primary-100 dim:text-theme-dim-200 mt-1 flex items-center justify-center rounded-full p-1 transition-all duration-100 ease-linear">
							<StatusDot status={status.value} />
						</div>
						<div>{status.label}</div>
					</div>
				</div>
			</Dropdown>
		</div>
	);
};
