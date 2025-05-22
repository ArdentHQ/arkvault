import React from "react";
import { Dropdown } from "@/app/components/Dropdown";
import { selectNetworkOptions, SelectNetworkToggleButton } from "./SelectNetwork.blocks";
import { Contracts } from "@/app/lib/profiles";
import { useActiveNetwork } from "@/app/hooks/use-active-network";

export const SelectNetwork = ({ profile }: { profile: Contracts.IProfile }) => {
	const { activeNetwork, setActiveNetwork } = useActiveNetwork({ profile });
	const isMainnet = activeNetwork.isLive();

	return (
		<div>
			<Dropdown
				toggleContent={(isOpen) => <SelectNetworkToggleButton isOpen={isOpen} isMainnet={isMainnet} />}
				onSelect={async (option) => {
					if (typeof option.value === "string") {
						await setActiveNetwork(option.value);
					}
				}}
				options={selectNetworkOptions({ isMainnet })}
			/>
		</div>
	);
};

export const SelectNetworkMobile = ({ profile }: { profile: Contracts.IProfile }) => {
	const { activeNetwork, setActiveNetwork } = useActiveNetwork({ profile });
	const isMainnet = activeNetwork.isLive();

	return (
		<div className="flex justify-between items-center py-4 px-6 w-full bg-theme-secondary-100 text-theme-text dark:bg-theme-dark-950">
			<span className="font-semibold text-theme-secondary-700 dark:text-theme-dark-200">Network</span>
			<Dropdown
				placement="bottom-end"
				wrapperClass="w-68"
				toggleContent={(isOpen) => <SelectNetworkToggleButton isOpen={isOpen} isMainnet={isMainnet} />}
				onSelect={async (option) => {
					if (typeof option.value === "string") {
						await setActiveNetwork(option.value);
					}
				}}
				options={selectNetworkOptions({ isMainnet })}
			/>
		</div>
	);
};
