import React, { useCallback, useEffect, useState } from "react";
import { Networks } from "@ardenthq/sdk";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { Icon } from "@/app/components/Icon";
import { Divider } from "@/app/components/Divider";
import { Tooltip } from "@/app/components/Tooltip";
import { Spinner } from "@/app/components/Spinner";
import { networkDisplayName } from "@/utils/network-utils";
import { NetworkIcon } from "@/domains/network/components/NetworkIcon";
import { useConfiguration } from "@/app/contexts";
import { pingServerAddress } from "@/utils/peers";

const NodeStatusNode: React.VFC<{
	network: Networks.Network;
	lastRow: boolean;
}> = ({ network, lastRow }) => {
	const { t } = useTranslation();

	const { serverStatus, setConfiguration } = useConfiguration();

	const [isOnline, setIsOnline] = useState<boolean | undefined>(undefined);

	const checkNetworkStatus = useCallback(async () => {
		setIsOnline(undefined);

		const fullHost = network.toObject().hosts.find((host) => host.type === "full")!;

		const musigHost = network.toObject().hosts.find((host) => host.type === "musig")!;

		const promises = [pingServerAddress(fullHost.host, "full")];

		if (musigHost) {
			promises.push(pingServerAddress(musigHost.host, "musig"));
		}

		const [fullHostResult, musigHostResult] = await Promise.allSettled(promises);

		const updatedServerStatus = { ...serverStatus };

		/* istanbul ignore next -- @preserve */
		if (updatedServerStatus[network.id()] === undefined) {
			updatedServerStatus[network.id()] = {};
		}

		updatedServerStatus[network.id()][fullHost.host] =
			fullHostResult.status === "fulfilled" && fullHostResult.value === true;

		if (musigHostResult) {
			updatedServerStatus[network.id()][musigHost.host] =
				musigHostResult.status === "fulfilled" && musigHostResult.value === true;
		}

		setIsOnline(
			updatedServerStatus[network.id()][fullHost.host] &&
				(updatedServerStatus[network.id()][musigHost?.host] ?? true),
		);

		setConfiguration({
			serverStatus: updatedServerStatus,
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

const NodesStatus: React.VFC<{ networks: Networks.Network[] }> = ({ networks }) => (
	<div data-testid="NodesStatus" className="mt-3 sm:grid sm:grid-cols-2 sm:gap-x-6">
		{networks.map((network, index) => (
			<NodeStatusNode
				key={network.id()}
				network={network}
				lastRow={index === networks.length - 1 || (networks.length % 2 === 0 && index === networks.length - 2)}
			/>
		))}
	</div>
);

export default NodesStatus;
