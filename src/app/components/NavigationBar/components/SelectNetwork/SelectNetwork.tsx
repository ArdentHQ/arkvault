import React, { useState } from "react";
import { Dropdown } from "@/app/components/Dropdown";
import { NetworkOption, selectNetworkOptions, SelectNetworkToggleButton } from "./SelectNetwork.blocks";

export const SelectNetwork = () => {
	const [isMainnet, setIsMainnet] = useState(true);

	return (
		<div>
			<Dropdown
				toggleContent={(isOpen) => <SelectNetworkToggleButton isOpen={isOpen} isMainnet={isMainnet} />}
				onSelect={(option) => setIsMainnet(option.value === NetworkOption.Mainnet)}
				options={selectNetworkOptions(isMainnet)}
			/>
		</div>
	);
};
