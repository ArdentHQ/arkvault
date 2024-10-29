import React from "react";

import { FilterOption } from "./FilterNetwork.contracts";
import { Badge } from "@/app/components/Badge";
import { Circle } from "@/app/components/Circle";
import { NetworkIcon } from "@/domains/network/components/NetworkIcon";

export const NetworkOption = ({ network, isSelected, onClick }: FilterOption) => {
	const renderOption = () => {
		if (isSelected) {
			return (
				<Circle size="lg" className="relative border-theme-primary-500">
					<NetworkIcon iconClassName="text-theme-primary-500" network={network} isCompact />
					<Badge
						className="border-transparent bg-theme-primary-500 text-theme-primary-100"
						icon="CheckmarkSmall"
					/>
				</Circle>
			);
		}

		return (
			<Circle size="lg" className="relative border-theme-secondary-300 dark:border-theme-secondary-800">
				<NetworkIcon iconClassName="text-theme-secondary-300" network={network} isCompact />
				<Badge className="border-theme-secondary-300 dark:border-theme-secondary-800" />
			</Circle>
		);
	};

	return (
		<li
			className="inline-block cursor-pointer pb-4 pr-4"
			data-testid={`NetworkOption__${network.id()}`}
			onClick={onClick}
		>
			{renderOption()}
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
