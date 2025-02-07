import React from "react";
import { Dropdown } from "@/app/components/Dropdown";
import { selectNetworkOptions, SelectNetworkToggleButton } from "./SelectNetwork.blocks";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useActiveNetwork } from "@/app/hooks/use-active-network";

export const SelectNetwork = ({ profile }: { profile: Contracts.IProfile }) => {
	const { activeNetwork, setActiveNetwork } = useActiveNetwork({ profile });
	const isMainnet = activeNetwork?.isLive();

	return (
		<div>
			<Dropdown
				toggleContent={(isOpen) => <SelectNetworkToggleButton isOpen={isOpen} isMainnet={isMainnet} />}
				onSelect={async (option) => {
					await setActiveNetwork(option.value);
				}}
				options={selectNetworkOptions({ isMainnet })}
			/>
		</div>
	);
};
