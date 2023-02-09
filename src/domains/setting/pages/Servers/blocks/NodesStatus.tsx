import React, { useCallback, useEffect, useState } from "react";
import { Networks } from "@ardenthq/sdk";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { Contracts, Environment } from "@ardenthq/sdk-profiles";
import { Icon } from "@/app/components/Icon";
import { Divider } from "@/app/components/Divider";
import { Tooltip } from "@/app/components/Tooltip";
import { Spinner } from "@/app/components/Spinner";
import { networkDisplayName } from "@/utils/network-utils";
import { NetworkIcon } from "@/domains/network/components/NetworkIcon";
import { ProfilePeers } from "@/utils/profile-peers";
import { ServerHealthStatus } from "@/domains/setting/pages/Servers/Servers.contracts";
import { useConfiguration } from "@/app/contexts";

const NodeStatusNode: React.VFC<{
	env: Environment;
	profile: Contracts.IProfile;
	network: Networks.Network;
	lastRow: boolean;
}> = ({ env, profile, network, lastRow }) => {
	const { t } = useTranslation();

	const { serverStatus, setConfiguration } = useConfiguration();

	const [status, setStatus] = useState<ServerHealthStatus | undefined>(undefined);

	const checkNetworkStatus = useCallback(async () => {
		setStatus(undefined);

		const defaultPeerStatus = await ProfilePeers(env, profile).healthStatusByNetwork(network.id(), "default");
		const customPeerStatus = await ProfilePeers(env, profile).healthStatusByNetwork(network.id(), "custom");

		setStatus(defaultPeerStatus[network.id()]);

		const getCombinedStatus = (defaultStatus: ServerHealthStatus, customStatus: ServerHealthStatus) => {
			const [first, second] = [defaultStatus, customStatus].sort();

			if (first === ServerHealthStatus.Healthy) {
				if (second === ServerHealthStatus.Healthy) {
					return ServerHealthStatus.Healthy;
				}

				return ServerHealthStatus.Downgraded;
			}

			return first;
		};

		setConfiguration({
			serverStatus: {
				...serverStatus,
				[network.id()]: getCombinedStatus(defaultPeerStatus[network.id()], customPeerStatus[network.id()]),
			},
		});
	}, [network]);

	useEffect(() => {
		checkNetworkStatus();

		const interval = setInterval(() => checkNetworkStatus(), 60 * 1000 * 5);

		return () => clearInterval(interval);
	}, []);

	return (
		<div
			data-testid="NodesStatus--node"
			className={cn(
				"flex items-center space-x-3 border-b border-theme-secondary-300 py-3 last:border-b-0 dark:border-theme-secondary-800 sm:border-b-0",
				{
					"sm:border-b": !lastRow,
				},
			)}
		>
			<div className="flex shrink-0">
				<NetworkIcon
					network={network}
					size="sm"
					className="text-theme-secondary-700 dark:text-theme-secondary-500"
					showTooltip={false}
					isCompact
				/>
			</div>

			<div className="flex-grow font-semibold text-theme-secondary-700 dark:text-theme-secondary-500">
				{networkDisplayName(network)}
			</div>
			<div className="cursor-pointer">
				{status === ServerHealthStatus.Healthy && (
					<Tooltip content={t("SETTINGS.SERVERS.NODE_STATUS_TOOLTIPS.HEALTHY")}>
						<div data-testid="NodeStatus--statusok">
							<Icon name="StatusOk" className="text-theme-success-600" size="lg" />
						</div>
					</Tooltip>
				)}
				{status === ServerHealthStatus.Downgraded && (
					<Tooltip content={t("SETTINGS.SERVERS.NODE_STATUS_TOOLTIPS.WITH_ISSUES")}>
						<div data-testid="NodeStatus--statuserror">
							<Icon name="StatusError" className="text-theme-warning-600" size="lg" />
						</div>
					</Tooltip>
				)}
				{status === ServerHealthStatus.Unavailable && (
					<Tooltip content={t("SETTINGS.SERVERS.NODE_STATUS_TOOLTIPS.WITH_ISSUES")}>
						<div data-testid="NodeStatus--statuserror">
							<Icon name="StatusError" className="text-theme-danger-400" size="lg" />
						</div>
					</Tooltip>
				)}
				{status === undefined && (
					<div data-testid="NodeStatus--statusloading">
						<Spinner size="sm" />
					</div>
				)}
			</div>

			<Divider type="vertical" />

			<div className="flex items-center">
				<button type="button" onClick={checkNetworkStatus} disabled={status === undefined}>
					<Icon
						name="ArrowRotateLeft"
						className={cn({
							"text-theme-primary-300 hover:text-theme-primary-400 dark:text-theme-secondary-600 hover:dark:text-theme-secondary-200":
								status !== undefined,
							"text-theme-secondary-600 dark:text-theme-secondary-800": status === undefined,
						})}
						size="md"
					/>
				</button>
			</div>
		</div>
	);
};

const NodesStatus: React.VFC<{ env: Environment; profile: Contracts.IProfile; networks: Networks.Network[] }> = ({
	env,
	profile,
	networks,
}) => (
	<div data-testid="NodesStatus" className="mt-3 sm:grid sm:grid-cols-2 sm:gap-x-6">
		{networks.map((network, index) => (
			<NodeStatusNode
				key={network.id()}
				env={env}
				profile={profile}
				network={network}
				lastRow={index === networks.length - 1 || (networks.length % 2 === 0 && index === networks.length - 2)}
			/>
		))}
	</div>
);

export default NodesStatus;
