import { Networks } from "@payvo/sdk";
import cn from "classnames";
import React, { memo } from "react";

import tw, { styled } from "twin.macro";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";
import { Size } from "@/types";
import { isCustomNetwork, networkDisplayName } from "@/utils/network-utils";

interface Properties {
	disabled?: boolean;
	network: Networks.Network;
	as?: React.ElementType;
	className?: string;
	iconClassName?: string;
	iconSize?: Size;
	shadowColor?: string;
	onClick?: () => void;
}

export const NetworkOptions = styled.ul`
	${tw`mt-3 grid grid-flow-row grid-cols-3 gap-2 sm:gap-3`};

	@media (min-width: 375px) {
		${tw`grid-cols-4`};
	}

	@media (min-width: 450px) {
		${tw`grid-cols-5`};
	}

	@media (min-width: 540px) {
		${tw`grid-cols-6`};
	}
`;

export const NetworkOption = memo(
	({ disabled, network, iconSize = "lg", iconClassName, onClick, ...properties }: Properties) => {
		const iconColorClass = network.isLive() ? "text-theme-primary-600" : "text-theme-secondary-700";

		const handleClick = () => {
			if (!disabled) {
				onClick?.();
			}
		};

		return (
			<li
				className={cn("relative flex h-0 cursor-pointer pb-[100%]", {
					"cursor-not-allowed": disabled,
				})}
				data-testid="SelectNetwork__NetworkIcon--container"
				onClick={handleClick}
			>
				<Tooltip content={networkDisplayName(network)}>
					<div
						className={`absolute inset-0 flex items-center justify-center rounded-xl border-2 ${
							iconClassName ||
							`border-theme-primary-100 dark:border-theme-secondary-800 ${iconColorClass}`
						}`}
						aria-label={networkDisplayName(network)}
						data-testid={`NetworkIcon-${network.coin()}-${network.id()}`}
						{...properties}
					>
						{!isCustomNetwork(network) && (
							<Icon data-testid="NetworkIcon__icon" name={network.ticker()} size={iconSize} />
						)}

						{isCustomNetwork(network) && networkDisplayName(network).slice(0, 2).toUpperCase()}
					</div>
				</Tooltip>
			</li>
		);
	},
);

NetworkOption.displayName = "NetworkOption";
