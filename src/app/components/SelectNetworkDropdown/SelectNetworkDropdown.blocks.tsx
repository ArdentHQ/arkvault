import React from "react";
import { Networks } from "@payvo/sdk";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { Tooltip } from "@/app/components/Tooltip";
import { Icon } from "@/app/components/Icon";
import { isCustomNetwork, networkDisplayName } from "@/utils/network-utils";
import { Size } from "@/types";

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

export const NetworkIconContent = ({ network, iconSize }: { network: Networks.Network; iconSize?: Size }) => {
	if (isCustomNetwork(network)) {
		return <>{networkDisplayName(network).slice(0, 2).toUpperCase()}</>;
	}

	return <Icon data-testid="NetworkIcon__icon" name={network.ticker()} size={iconSize} />;
};

export const NetworkIcon = ({
	network,
	className,
	iconSize,
}: {
	network: Networks.Network;
	className?: string;
	iconSize?: Size;
}) => (
	<div
		className={cn(
			"flex items-center justify-center rounded-xl p-1",
			{
				"text-theme-primary-600": network.isLive(),
				"text-theme-secondary-700": !network.isLive(),
			},
			className,
		)}
		aria-label={networkDisplayName(network)}
	>
		<NetworkIconContent network={network} iconSize={iconSize} />
	</div>
);

export const NetworkOptionLabel = ({ label, value, networkById }: any): JSX.Element => {
	const network = networkById(value);

	if (!network) {
		return <></>;
	}

	return (
		<div className="flex items-center space-x-3">
			<NetworkIcon network={network} />
			<div className="flex-grow">{label}</div>
			{network.isTest() && <NetworkTestnetCodeIcon />}
		</div>
	);
};
