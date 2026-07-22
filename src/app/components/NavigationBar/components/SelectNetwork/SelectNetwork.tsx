import React from "react";
import { DropdownRoot, DropdownToggle, DropdownContent, DropdownListItem } from "@/app/components/SimpleDropdown";
import { selectNetworkOptions, SelectNetworkToggleButton } from "./SelectNetwork.blocks";
import { Contracts } from "@/app/lib/profiles";
import { useActiveNetwork } from "@/app/hooks/use-active-network";

export const SelectNetwork = ({ profile }: { profile: Contracts.IProfile }) => {
	const { activeNetwork, setActiveNetwork } = useActiveNetwork({ profile });
	const isMainnet = activeNetwork.isLive();

	return (
		<div>
			<DropdownRoot>
				<DropdownToggle>
					{({ isOpen }) => <SelectNetworkToggleButton isOpen={isOpen} isMainnet={isMainnet} />}
				</DropdownToggle>
				<DropdownContent>
					<ul>
						{selectNetworkOptions({ isMainnet }).map((option, index) => (
							<DropdownListItem
								key={option.value}
								data-testid={`dropdown__option--${index}`}
								onClick={async () => {
									if (typeof option.value === "string") {
										await setActiveNetwork(option.value);
									}
								}}
							>
								{option.label}
							</DropdownListItem>
						))}
					</ul>
				</DropdownContent>
			</DropdownRoot>
		</div>
	);
};

export const SelectNetworkMobile = ({ profile }: { profile: Contracts.IProfile }) => {
	const { activeNetwork, setActiveNetwork } = useActiveNetwork({ profile });
	const isMainnet = activeNetwork.isLive();

	return (
		<div className="flex w-full items-center justify-between bg-theme-secondary-100 px-6 py-4 text-theme-text dark:bg-theme-dark-950">
			<span className="font-semibold text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-dark-200">
				Network
			</span>
			<DropdownRoot>
				<DropdownToggle>
					{({ isOpen }) => <SelectNetworkToggleButton isOpen={isOpen} isMainnet={isMainnet} />}
				</DropdownToggle>
				<DropdownContent className="w-68">
					<ul>
						{selectNetworkOptions({ isMainnet }).map((option, index) => (
							<DropdownListItem
								key={option.value}
								data-testid={`dropdown__option--${index}`}
								onClick={async () => {
									if (typeof option.value === "string") {
										await setActiveNetwork(option.value);
									}
								}}
							>
								{option.label}
							</DropdownListItem>
						))}
					</ul>
				</DropdownContent>
			</DropdownRoot>
		</div>
	);
};
