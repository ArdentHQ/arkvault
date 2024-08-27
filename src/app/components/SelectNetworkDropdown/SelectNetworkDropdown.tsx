import { Networks } from "@ardenthq/sdk";
import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { NetworkOptionLabel } from "./SelectNetworkDropdown.blocks";
import { Select, OptionProperties } from "@/app/components/SelectDropdown";
import { networksAsOptions } from "@/utils/network-utils";

interface SelectNetworkDropdownProperties {
	networks?: Networks.Network[];
	selectedNetwork?: Networks.Network;
	placeholder?: string;
	profile: Contracts.IProfile;
	onChange?: (network?: Networks.Network) => void;
	isDisabled?: boolean;
}

export const SelectNetworkDropdown = React.forwardRef<HTMLInputElement, SelectNetworkDropdownProperties>(
	({ networks, selectedNetwork, placeholder, isDisabled, onChange }: SelectNetworkDropdownProperties, reference) => {
		const findById = (networkId?: string | number) => networks?.find((network) => network.id() === networkId);

		return (
			<Select
				disabled={isDisabled}
				defaultValue={selectedNetwork?.id()}
				options={networksAsOptions(networks)}
				placeholder={placeholder}
				renderLabel={(properties) => <NetworkOptionLabel network={findById(properties.value)} />}
				onChange={(option?: OptionProperties) => onChange?.(findById(option?.value))}
				ref={reference}
			/>
		);
	},
);

SelectNetworkDropdown.displayName = "SelectNetworkDropdown";
