import { Networks } from "@/app/lib/mainsail";
import cn from "classnames";
import React from "react";

import { Circle, CircleProperties } from "@/app/components/Circle";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";
import { Size } from "@/types";
import { networkDisplayName } from "@/utils/network-utils";

interface NetworkIconProperties {
	network?: Networks.Network;
	as?: React.ElementType;
	size?: Size;
	className?: string;
	shadowClassName?: string;
	iconClassName?: string;
	iconSize?: Size;
	showTooltip?: boolean;
	noShadow?: boolean;
	isCompact?: boolean;
}

const Placeholder = (properties: CircleProperties) => (
	<Circle
		data-testid="NetworkIcon__placeholder"
		className="border-theme-secondary-200 text-theme-secondary-500 dark:border-theme-secondary-700"
		{...properties}
	/>
);

export const NetworkIcon = ({
	network,
	iconSize = "lg",
	className,
	iconClassName,
	showTooltip = true,
	isCompact = false,
	...properties
}: NetworkIconProperties) => {
	if (!network) {
		return <Placeholder className={className} {...properties} />;
	}

	const getClassName = () => {
		if (className) {
			return className;
		}

		if (network.isLive()) {
			return "text-theme-primary-600 border-theme-primary-100 dark:border-theme-primary-600";
		}

		return "text-theme-secondary-700 border-theme-secondary-300 dark:border-theme-secondary-700";
	};

	const renderIcon = () => {
		const TickerIcon = () => (
			<Icon
				className={iconClassName}
				data-testid="NetworkIcon__icon"
				name={network.ticker()}
				fallback={
					<span className={isCompact ? "inline-flex w-5 justify-center text-sm" : undefined}>
						{networkDisplayName(network).slice(0, 2).toUpperCase()}
					</span>
				}
				size={iconSize}
			/>
		);

		if (isCompact) {
			return (
				<div
					aria-label={networkDisplayName(network)}
					data-testid={`NetworkIcon-${network.coin()}-${network.id()}`}
					className={cn("inline-flex h-5 w-5 items-center justify-center", getClassName())}
				>
					<TickerIcon />
				</div>
			);
		}

		return (
			<Circle
				aria-label={networkDisplayName(network)}
				data-testid={`NetworkIcon-${network.coin()}-${network.id()}`}
				className={getClassName()}
				{...properties}
			>
				<TickerIcon />
			</Circle>
		);
	};

	return (
		<Tooltip content={networkDisplayName(network)} disabled={!showTooltip}>
			{renderIcon()}
		</Tooltip>
	);
};
