import { Networks } from "@ardenthq/sdk";
import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { NetworkOptionLabel, NetworkIcon } from "./SelectNetworkDropdown.blocks";
import { Select, OptionProperties } from "@/app/components/SelectDropdown";
import { useNetworkOptions } from "@/app/hooks";

interface SelectNetworkDropdownProperties {
	networks?: Networks.Network[];
	selectedNetwork?: Networks.Network;
	placeholder?: string;
	profile: Contracts.IProfile;
	onChange?: (network?: Networks.Network) => void;
}

export const SelectNetworkDropdown = React.forwardRef<HTMLInputElement, SelectNetworkDropdownProperties>(
	({ profile, networks, selectedNetwork, placeholder, onChange }: SelectNetworkDropdownProperties, reference) => {
		const { networkOptions, networkById } = useNetworkOptions({ profile });

		return (
			<Select
				defaultValue={selectedNetwork?.id()}
				options={networkOptions(networks)}
				placeholder={placeholder}
				renderLabel={(properties) => <NetworkOptionLabel {...properties} networkById={networkById} />}
				onChange={(option?: OptionProperties) => {
					onChange?.(networkById(option?.value as string));
				}}
				ref={reference}
				addons={{
					start: {
						content: selectedNetwork && <NetworkIcon network={selectedNetwork} />,
					},
				}}
			/>
		);
	},
);

SelectNetworkDropdown.displayName = "SelectNetworkDropdown";
