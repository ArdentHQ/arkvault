import { Networks } from "@/app/lib/mainsail";
import React from "react";
import { Contracts } from "@/app/lib/profiles";
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
	ref?: React.Ref<HTMLInputElement>;
}

export const SelectNetworkDropdown = ({
	networks,
	selectedNetwork,
	placeholder,
	isDisabled,
	onChange,
	ref,
}: SelectNetworkDropdownProperties) => {
	const findById = (networkId?: string | number) => networks?.find((network) => network.id() === networkId);

	return (
		<Select
			disabled={isDisabled}
			defaultValue={selectedNetwork?.id()}
			options={networksAsOptions(networks)}
			placeholder={placeholder}
			renderLabel={(properties) => <NetworkOptionLabel network={findById(properties.value)} />}
			onChange={(option?: OptionProperties) => onChange?.(findById(option?.value))}
			ref={ref}
		/>
	);
};

SelectNetworkDropdown.displayName = "SelectNetworkDropdown";
