import { Networks } from "@ardenthq/sdk";
import cn from "classnames";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Divider } from "@/app/components/Divider";
import { Icon } from "@/app/components/Icon";
import { Spinner } from "@/app/components/Spinner";
import { Tooltip } from "@/app/components/Tooltip";
import { useConfiguration } from "@/app/contexts";
import { useBreakpoint } from "@/app/hooks";
import { NetworkIcon } from "@/domains/network/components/NetworkIcon";
import { networkDisplayName } from "@/utils/network-utils";
import { pingServerAddress } from "@/utils/peers";

const NodeStatusNode: React.VFC<{
	network: Networks.Network;
	host: Networks.NetworkHost;
	lastRow: boolean;
}> = ({ network, host, lastRow }) => {
	const { t } = useTranslation();
	const { isXs } = useBreakpoint();

	const { serverStatus, setConfiguration } = useConfiguration();

	const [isOnline, setIsOnline] = useState<boolean | undefined>(undefined);

	const checkNetworkStatus = useCallback(async () => {
		setIsOnline(undefined);

		const promises = [pingServerAddress(host.host, host.type)];

		const [result] = await Promise.allSettled(promises);

		const updatedServerStatus = { ...serverStatus };

		/* istanbul ignore next -- @preserve */
		if (updatedServerStatus[network.id()] === undefined) {
			updatedServerStatus[network.id()] = {};
		}

		updatedServerStatus[network.id()][host.host] = result.status === "fulfilled" && result.value === true;

		setIsOnline(updatedServerStatus[network.id()][host.host]);

		setConfiguration({
			serverStatus: updatedServerStatus,
		});
	}, [network]);

	useEffect(() => {
		checkNetworkStatus();

		const interval = setInterval(() => checkNetworkStatus(), 60 * 1000 * 5);

		return () => clearInterval(interval);
	}, []);

	const renderDisplayName = () => {
		let name = networkDisplayName(network);

		if (host.type === "musig") {
			name = `${name} ${t("COMMON.MULTISIG")}`;
		}

		return name;
	};

	return (
		<div
			data-testid="NodesStatus--node"
			className={cn(
				"flex items-center space-x-3 border-theme-secondary-300 py-3 dark:border-theme-secondary-800",
				{
					"border-b": !isXs && !lastRow,
					"border-b last:border-b-0": isXs,
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
				{renderDisplayName()}
			</div>
			<div className="cursor-pointer">
				{isOnline === true && (
					<Tooltip content={t("SETTINGS.SERVERS.NODE_STATUS_TOOLTIPS.HEALTHY")}>
						<div data-testid="NodeStatus--statusok">
							<Icon name="StatusOk" className="text-theme-success-600" size="lg" />
						</div>
					</Tooltip>
				)}
				{isOnline === false && (
					<Tooltip content={t("SETTINGS.SERVERS.NODE_STATUS_TOOLTIPS.WITH_ISSUES")}>
						<div data-testid="NodeStatus--statuserror">
							<Icon name="StatusError" className="text-theme-danger-400" size="lg" />
						</div>
					</Tooltip>
				)}
				{isOnline === undefined && (
					<div data-testid="NodeStatus--statusloading">
						<Spinner size="sm" />
					</div>
				)}
			</div>

			<Divider type="vertical" />

			<div className="flex items-center">
				<button type="button" onClick={checkNetworkStatus} disabled={isOnline === undefined}>
					<Icon
						name="ArrowRotateLeft"
						className={cn({
							"text-theme-primary-300 hover:text-theme-primary-400 dark:text-theme-secondary-600 hover:dark:text-theme-secondary-200":
								isOnline !== undefined,
							"text-theme-secondary-600 dark:text-theme-secondary-800": isOnline === undefined,
						})}
						size="md"
					/>
				</button>
			</div>
		</div>
	);
};

const NodesStatus: React.VFC<{ networks: Networks.Network[] }> = ({ networks }) => {
	let count = 0;
	let index = 0;

	const hostGroups: { network: Networks.Network; hosts: Networks.NetworkHost[] }[] = [];

	for (const network of networks) {
		const networkHosts = network.toObject().hosts.filter((host) => host.type === "full" || host.type === "musig");

		if (networkHosts.length > 0) {
			hostGroups.push({ hosts: networkHosts, network });

			count += networkHosts.length;
		}
	}

	return (
		<div data-testid="NodesStatus" className="mt-3 sm:grid sm:grid-cols-2 sm:gap-x-6">
			{hostGroups.map((hostGroup) =>
				hostGroup.hosts.map((host) => {
					index++;

					return (
						<NodeStatusNode
							key={`${hostGroup.network.id()}-${host.type}`}
							network={hostGroup.network}
							host={host}
							lastRow={index === count || (count % 2 === 0 && index === count - 1)}
						/>
					);
				}),
			)}
		</div>
	);
};

export default NodesStatus;
