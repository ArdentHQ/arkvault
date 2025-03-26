import React, { useCallback, useEffect, useState } from "react";
import { Networks } from "@ardenthq/sdk";
import { useTranslation } from "react-i18next";
import { Icon } from "@/app/components/Icon";
import { Divider } from "@/app/components/Divider";
import { Tooltip } from "@/app/components/Tooltip";
import { Spinner } from "@/app/components/Spinner";
import { networkDisplayName } from "@/utils/network-utils";
import { NetworkIcon } from "@/domains/network/components/NetworkIcon";
import { useConfiguration } from "@/app/contexts";
import { pingServerAddress } from "@/utils/peers";
import { useActiveProfile } from "@/app/hooks";

const NodeStatusNode: React.VFC<{
	network: Networks.Network;
	host: Networks.NetworkHost;
}> = ({ network, host }) => {
	const { t } = useTranslation();

	const profile = useActiveProfile();

	const { setConfiguration, getProfileConfiguration } = useConfiguration();

	const { serverStatus } = getProfileConfiguration(profile.id());

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

		setConfiguration(profile.id(), {
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
			className="flex items-center space-x-3 rounded-lg border border-theme-secondary-300 px-4 py-3 leading-none text-theme-secondary-700 dark:border-theme-dark-700 dark:text-theme-dark-200"
		>
			<div className="flex shrink-0">
				<NetworkIcon network={network} size="sm" className="" showTooltip={false} isCompact />
			</div>

			<div className="flex-grow font-semibold">{renderDisplayName()}</div>

			<div className="cursor-pointer">
				{isOnline === true && (
					<Tooltip content={t("SETTINGS.SERVERS.NODE_STATUS_TOOLTIPS.HEALTHY")}>
						<div data-testid="NodeStatus--statusok">
							<Icon
								name="StatusOk"
								className="text-theme-success-600 dark:text-theme-success-500"
								size="lg"
							/>
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
				<button
					type="button"
					onClick={checkNetworkStatus}
					disabled={isOnline === undefined}
					className="transition-colors hover:text-theme-primary-700 dark:hover:text-theme-dark-50"
				>
					<Icon name="ArrowRotateLeft" size="md" />
				</button>
			</div>
		</div>
	);
};

const NodesStatus: React.VFC<{ networks: Networks.Network[] }> = ({ networks }) => {
	const hostGroups: { network: Networks.Network; hosts: Networks.NetworkHost[] }[] = [];

	for (const network of networks) {
		const networkHosts = network.toObject().hosts.filter((host) => host.type === "full" || host.type === "musig");

		if (networkHosts.length > 0) {
			hostGroups.push({ hosts: networkHosts, network });
		}
	}

	return (
		<div data-testid="NodesStatus" className="mt-3 grid gap-3 md:grid-cols-2">
			{hostGroups.map((hostGroup) =>
				hostGroup.hosts.map((host) => (
					<NodeStatusNode
						key={`${hostGroup.network.id()}-${host.type}`}
						network={hostGroup.network}
						host={host}
					/>
				)),
			)}
		</div>
	);
};

export default NodesStatus;
