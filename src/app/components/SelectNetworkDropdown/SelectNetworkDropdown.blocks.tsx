import React from "react";
import { Networks } from "@ardenthq/sdk";
import { useTranslation } from "react-i18next";
import { Tooltip } from "@/app/components/Tooltip";
import { Icon } from "@/app/components/Icon";
import { networkDisplayName } from "@/utils/network-utils";
import { NetworkIcon } from "@/domains/network/components/NetworkIcon";

export const NetworkTestnetCodeIcon = () => {
	const { t } = useTranslation();

	return (
		<Tooltip content={t("COMMON.TEST_NETWORK")}>
			<span>
				<Icon className="text-theme-secondary-500 dark:text-theme-secondary-700" name="Code" size="lg" />
			</span>
		</Tooltip>
	);
};

export const NetworkOptionLabel = ({ network }: { network?: Networks.Network }) => {
	if (!network) {
		return <></>;
	}

	return (
		<div className="flex items-center space-x-3">
			<NetworkIcon network={network} showTooltip={false} isCompact />
			<div className="flex-grow">{networkDisplayName(network)}</div>
			{network.isTest() && <NetworkTestnetCodeIcon />}
		</div>
	);
};
