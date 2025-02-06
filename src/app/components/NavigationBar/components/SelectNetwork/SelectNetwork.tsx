import React, { useState } from "react";
import { Dropdown } from "@/app/components/Dropdown";
import { NetworkOption, selectNetworkOptions, SelectNetworkToggleButton } from "./SelectNetwork.blocks";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useEnvironmentContext } from "@/app/contexts";

export const SelectNetwork = ({ profile }: { profile: Contracts.IProfile }) => {
	const { persist } = useEnvironmentContext();
	const isTestnetEnabled = profile.settings().get(Contracts.ProfileSetting.IsTestnetEnabled)

	return (
		<div>
			<Dropdown
				toggleContent={(isOpen) => <SelectNetworkToggleButton isOpen={isOpen} isMainnet={!isTestnetEnabled} />}
				onSelect={async (option) => {
					profile.settings().set(Contracts.ProfileSetting.IsTestnetEnabled, option.value === NetworkOption.Testnet)
					await persist()
				}}
				options={selectNetworkOptions(!isTestnetEnabled)}
			/>
		</div>
	);
};
