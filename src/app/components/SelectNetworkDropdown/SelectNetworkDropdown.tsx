import { Networks } from "@payvo/sdk";
import React from "react";
import { Contracts } from "@payvo/sdk-profiles";
import { NetworkOptionLabel, NetworkIcon } from "./SelectNetworkDropdown.blocks";
import { Select, OptionProperties } from "@/app/components/SelectDropdown";
import { useNetworkOptions } from "@/app/hooks";

interface SelectNetworkDropdownProperties {
	networks?: Networks.Network[];
	selectedNetwork?: Networks.Network;
	placeholder?: string;
	profile: Contracts.IProfile;
	onChange?: (network?: Networks.Network) => void;
	isDisabled?: boolean;
}

export const SelectNetworkDropdown = React.forwardRef<HTMLInputElement, SelectNetworkDropdownProperties>(
	(
		{ profile, networks, selectedNetwork, placeholder, isDisabled, onChange }: SelectNetworkDropdownProperties,
		reference,
	) => {
		const { networkOptions } = useNetworkOptions({ profile });
		const findById = (networkId?: string | number) => networks?.find((network) => network.id() === networkId);

		return (
			<Select
				disabled={isDisabled}
				defaultValue={selectedNetwork?.id()}
				options={networkOptions(networks)}
				placeholder={placeholder}
				renderLabel={(properties) => <NetworkOptionLabel network={findById(properties.value)} />}
				onChange={(option?: OptionProperties) => onChange?.(findById(option?.value))}
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
