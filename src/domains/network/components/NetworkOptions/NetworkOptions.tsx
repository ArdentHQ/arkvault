import { Networks } from "@ardenthq/sdk";
import React, { memo } from "react";

import { NetworkTestnetCodeIcon } from "@/app/components/SelectNetworkDropdown/SelectNetworkDropdown.blocks";
import { NetworkIcon } from "@/domains/network/components/NetworkIcon";
import { networkDisplayName } from "@/utils/network-utils";

import { NetworkOptionProperties, NetworkOptionsProperties } from "./NetworkOptions.contracts";
import { optionClasses, wrapperClasses } from "./NetworkOptions.styles";

export const NetworkOption = memo(
	({ disabled, network, iconSize = "lg", isSelected, onSelect, onDeselect }: NetworkOptionProperties) => {
		const handleClick = () => {
			if (disabled) {
				return;
			}

			if (isSelected) {
				onDeselect?.();
				return;
			}

			onSelect?.();
		};

		return (
			<li className={wrapperClasses(disabled)} data-testid="NetworkOption" onClick={handleClick}>
				<div
					className={optionClasses(isSelected)}
					aria-label={networkDisplayName(network)}
					data-testid={`NetworkOption-${network.coin()}-${network.id()}`}
				>
					<div className="flex items-center space-x-4">
						<NetworkIcon network={network} iconSize={iconSize} showTooltip={false} isCompact />

						<div className="font-semibold text-theme-secondary-700 dark:text-theme-secondary-200">
							{networkDisplayName(network)}
						</div>
					</div>

					{network.isTest?.() && <NetworkTestnetCodeIcon />}
				</div>
			</li>
		);
	},
);

export const NetworkOptions = ({ disabled = false, networks = [], onSelect, selected }: NetworkOptionsProperties) => (
	<div
		data-testid="NetworkOptions"
		className="flex-col space-x-0 space-y-3 sm:flex sm:flex-row sm:space-x-3 sm:space-y-0"
	>
		{networks.map((network: Networks.Network) => (
			<NetworkOption
				key={network.id()}
				disabled={disabled}
				network={network}
				isSelected={network.id() === selected?.id()}
				onSelect={() => {
					onSelect?.(network);
				}}
				onDeselect={() => {
					onSelect?.();
				}}
			/>
		))}
	</div>
);

NetworkOption.displayName = "NetworkOption";
NetworkOptions.displayName = "NetworkOptions";
