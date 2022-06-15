import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";

import { SelectNetworkDropdown } from "@/app/components/SelectNetworkDropdown";
import { NetworkOptions } from "@/domains/network/components/NetworkOptions";

export const SelectNetwork = ({
	id = "SelectNetwork",
	isDisabled,
	networks,
	selectedNetwork,
	onSelect,
	profile,
}: {
	id?: string;
	profile: Contracts.IProfile;
	onSelect?: (network?: Networks.Network | null) => void;
	isDisabled?: boolean;
	networks: Networks.Network[];
	selectedNetwork?: Networks.Network;
}) => (
	<div data-testid={id}>
		{networks.length === 2 && (
			<NetworkOptions disabled={isDisabled} networks={networks} selected={selectedNetwork} onSelect={onSelect} />
		)}

		{networks.length > 2 && (
			<SelectNetworkDropdown
				selectedNetwork={selectedNetwork}
				networks={networks}
				profile={profile}
				onChange={onSelect}
				isDisabled={isDisabled}
			/>
		)}
	</div>
);
