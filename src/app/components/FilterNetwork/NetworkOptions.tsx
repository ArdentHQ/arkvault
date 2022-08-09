import React from "react";

import { FilterOption } from "./FilterNetwork.contracts";
import { Badge } from "@/app/components/Badge";
import { Circle } from "@/app/components/Circle";
import { Tooltip } from "@/app/components/Tooltip";
import { networkDisplayName } from "@/utils/network-utils";
import { NetworkIconContent } from "@/app/components/SelectNetworkDropdown/SelectNetworkDropdown.blocks";

export const NetworkOption = ({ network, isSelected, onClick }: FilterOption) => {
	const renderOption = () => {
		if (isSelected) {
			return (
				<Circle size="lg" className="relative border-theme-primary-500 text-theme-primary-500">
					<NetworkIconContent network={network} />
					<Badge
						className="border-transparent bg-theme-primary-500 text-theme-primary-100"
						icon="CheckmarkSmall"
					/>
				</Circle>
			);
		}

		return (
			<Circle
				size="lg"
				className="relative border-theme-secondary-300 text-theme-secondary-300 dark:border-theme-secondary-800"
			>
				<NetworkIconContent network={network} />
				<Badge className="border-theme-secondary-300 dark:border-theme-secondary-800" />
			</Circle>
		);
	};

	return (
		<li
			className="inline-block cursor-pointer pr-5 pb-5"
			data-testid={`NetworkOption__${network.id()}`}
			onClick={onClick}
		>
			<Tooltip content={networkDisplayName(network)}>{renderOption()}</Tooltip>
		</li>
	);
};

export const NetworkOptions = ({
	networks,
	onClick,
}: {
	networks: FilterOption[];
	onClick: (network: FilterOption, key: number) => void;
}) => (
	<ul data-testid="NetworkOptions" className="flex flex-wrap">
		{networks.map((network: FilterOption, key: number) => (
			<NetworkOption {...network} key={key} onClick={() => onClick(network, key)} />
		))}
	</ul>
);
