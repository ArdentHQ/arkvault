import React, { useCallback, useEffect, useState } from "react";
import { Networks } from "@/app/lib/mainsail";
import { Trans, useTranslation } from "react-i18next";
import { Icon } from "@/app/components/Icon";
import { Divider } from "@/app/components/Divider";
import { Tooltip } from "@/app/components/Tooltip";
import { Spinner } from "@/app/components/Spinner";
import { networkDisplayName } from "@/utils/network-utils";
import { useConfiguration } from "@/app/contexts";
import { pingServerAddress } from "@/utils/peers";
import { useActiveProfile } from "@/app/hooks";
import { NetworkIcon } from "@/app/components/NetworkIcon";
import { pingEvmApi, pingTransactionApi } from "@/domains/setting/hooks/use-handle-servers";

const NodeStatusNode = ({ network, hosts }: { network: Networks.Network; hosts: HostGroup }) => {
	const { t } = useTranslation();

	const profile = useActiveProfile();

	const [publicHost, txHost, evmHost] = hosts;

	const { setConfiguration, getProfileConfiguration } = useConfiguration();

	const { serverStatus } = getProfileConfiguration(profile.id());

	const [isPublicHostOnline, setIsPublicHostOnline] = useState<boolean | undefined>(undefined);
	const [isTxHostOnline, setIsTxHostOnline] = useState<boolean | undefined>(undefined);
	const [isEvmHostOnline, setIsEvmHostOnline] = useState<boolean | undefined>(undefined);

	const checkNetworkStatus = useCallback(async () => {
		setIsPublicHostOnline(undefined);
		setIsTxHostOnline(undefined);
		setIsEvmHostOnline(undefined);

		const results = await Promise.allSettled([
			pingServerAddress(publicHost.host, "full"),
			pingTransactionApi(txHost.host),
			pingEvmApi(evmHost.host),
		]);

		const [publicHostStatus, txHostStatus, evmHostStatus] = results.map(
			(result) => result.status === "fulfilled" && result.value === true,
		);

		setIsPublicHostOnline(publicHostStatus);
		setIsTxHostOnline(txHostStatus);
		setIsEvmHostOnline(evmHostStatus);

		const networkId = network.id();
		const updatedServerStatus = { ...serverStatus };

		/* istanbul ignore next -- @preserve */
		if (updatedServerStatus[networkId] === undefined) {
			updatedServerStatus[networkId] = {};
		}

		updatedServerStatus[networkId][publicHost.host] = publicHostStatus;
		updatedServerStatus[networkId][txHost.host] = txHostStatus;
		updatedServerStatus[networkId][evmHost.host] = evmHostStatus;

		setConfiguration(profile.id(), {
			serverStatus: updatedServerStatus,
		});
	}, [network]);

	useEffect(() => {
		checkNetworkStatus();

		const interval = setInterval(() => checkNetworkStatus(), 60 * 1000 * 5);

		return () => clearInterval(interval);
	}, []);

	const results = [isPublicHostOnline, isTxHostOnline, isEvmHostOnline];

	const renderUnresponsiveMessage = () => {
		const unresponsiveEndpointsCount = results.filter((r) => r === false).length;

		if (unresponsiveEndpointsCount === 0) {
			return null;
		}

		// if all are failing
		if (unresponsiveEndpointsCount === 3) {
			return (
				<Tooltip content={t("SETTINGS.SERVERS.NODE_STATUS_TOOLTIPS.WITH_ISSUES")}>
					<div data-testid="NodeStatus--statuserror">
						<Icon name="StatusError" className="text-theme-danger-400" size="lg" />
					</div>
				</Tooltip>
			);
		}

		const translations = [
			t("SETTINGS.SERVERS.NODE_STATUS_TOOLTIPS.PUBLIC_API"),
			t("SETTINGS.SERVERS.NODE_STATUS_TOOLTIPS.TX_API"),
			t("SETTINGS.SERVERS.NODE_STATUS_TOOLTIPS.EVM_API"),
		];

		const messages: Record<string, string> = {};

		let key = 0;

		for (const [index, value] of results.entries()) {
			if (value === false) {
				messages[`host${key}`] = translations[index];
				key++;
			}
		}

		// if two of them are failing
		if (unresponsiveEndpointsCount === 2) {
			return (
				<Tooltip
					maxWidth={350}
					content={<Trans i18nKey="SETTINGS.SERVERS.NODE_STATUS_TOOLTIPS.WITH_ISSUES_2" values={messages} />}
				>
					<div data-testid="NodeStatus--statuserror">
						<Icon name="StatusError" className="text-theme-danger-400" size="lg" />
					</div>
				</Tooltip>
			);
		}

		return (
			<Tooltip
				content={<Trans i18nKey="SETTINGS.SERVERS.NODE_STATUS_TOOLTIPS.WITH_ISSUES_1" values={messages} />}
			>
				<div data-testid="NodeStatus--statuserror">
					<Icon name="StatusError" className="text-theme-danger-400" size="lg" />
				</div>
			</Tooltip>
		);
	};

	return (
		<div
			data-testid="NodesStatus--node"
			className="border-theme-secondary-300 text-theme-secondary-700 dark:border-theme-dark-700 dark:text-theme-dark-200 dim:border-theme-dim-700 dim:text-theme-dim-200 flex items-center space-x-3 rounded-lg border px-4 py-3 leading-none"
		>
			<div className="flex shrink-0">
				<NetworkIcon network={network} size="sm" className="" showTooltip={false} isCompact />
			</div>

			<div className="dim:text-theme-dim-200 grow font-semibold">{networkDisplayName(network)}</div>

			<div className="cursor-pointer">
				{results.every((r) => r === true) && (
					<Tooltip content={t("SETTINGS.SERVERS.NODE_STATUS_TOOLTIPS.HEALTHY")}>
						<div data-testid="NodeStatus--statusok">
							<Icon
								name="StatusOk"
								className="text-theme-success-600 dark:text-theme-success-500 dim:text-theme-success-500"
								size="lg"
							/>
						</div>
					</Tooltip>
				)}

				{renderUnresponsiveMessage()}

				{results.includes(undefined) && (
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
					disabled={results.includes(undefined)}
					className="dark:hover:text-theme-dark-50 hover:text-theme-primary-700 dim:hover:text-theme-dim-50 transition-colors"
				>
					<Icon name="ArrowRotateLeft" size="md" />
				</button>
			</div>
		</div>
	);
};

type HostGroup = [Networks.NetworkHost, Networks.NetworkHost, Networks.NetworkHost];

const NodesStatus = ({ networks }: { networks: Networks.Network[] }) => {
	const hostGroups: Record<string, { network: Networks.Network; hosts: HostGroup }> = {};

	for (const network of networks) {
		const hosts = network.toObject().hosts;
		const publicHost = hosts.find((host) => host.type === "full");
		const txHost = hosts.find((host) => host.type === "tx");
		const evmHost = hosts.find((host) => host.type === "evm");

		if (publicHost && txHost && evmHost) {
			hostGroups[network.id()] = {
				hosts: [publicHost, txHost, evmHost],
				network,
			};
		}
	}

	return (
		<div data-testid="NodesStatus" className="mt-3 grid gap-3 md:grid-cols-2">
			{Object.values(hostGroups).map((hostGroup) => (
				<NodeStatusNode key={`${hostGroup.network.id()}`} network={hostGroup.network} hosts={hostGroup.hosts} />
			))}
		</div>
	);
};

export default NodesStatus;
