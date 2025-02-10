import React, { ReactElement } from "react";
import cn from "classnames";
import { DropdownOption } from "@/app/components/Dropdown";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";

export enum NetworkOption {
	Mainnet = "mainsail.mainnet",
	Testnet = "mainsail.devnet",
}

export const MainnetOption = () => (
	<>
		<span className="rounded-sm border-2 border-theme-primary-300 bg-theme-primary-50 p-[3px] text-theme-primary-600 dark:border-theme-primary-500 dark:bg-theme-dark-900">
			<Icon name="Mainnet" width={14} height={14} />
		</span>

		<span className="text-sm">Mainnet</span>
	</>
);

export const TestnetOption = () => (
	<>
		<span className="rounded-sm border-2 border-theme-warning-300 bg-theme-warning-50 p-[3px] text-theme-warning-600 dark:border-theme-danger-info-border dark:bg-transparent dark:text-theme-danger-info-text">
			<Icon name="Testnet" width={14} height={14} />
		</span>

		<span className="text-sm">Testnet</span>
	</>
);

export const NetworkDropdownOption = ({ isSelected, children }: { isSelected?: boolean; children: ReactElement }) => (
	<div className="flex min-w-40 items-center justify-between">
		<div className="flex items-center space-x-2">{children}</div>

		{isSelected && <Icon name="CheckmarkDouble" className="text-theme-primary-600 dark:text-theme-text" />}
	</div>
);

export const SelectNetworkToggleButton = ({ isOpen, isMainnet }: { isOpen?: boolean; isMainnet?: boolean }) => (
	<Button
		className="w-auto text-theme-secondary-700 text-theme-secondary-900 hover:bg-theme-primary-100 hover:text-theme-primary-600 dark:text-theme-secondary-600 dark:hover:bg-theme-secondary-800 p-1"
		data-testid="NavigationBar__buttons--network"
		size="icon"
		variant="transparent"
	>
		{isMainnet && <MainnetOption />}

		{!isMainnet && <TestnetOption />}

		<Icon
			role="img"
			name="ChevronDownSmall"
			className={cn("transition-transform", {
				"rotate-180": isOpen,
			})}
			size="sm"
		/>
	</Button>
);

export const selectNetworkOptions = ({ isMainnet }: { isMainnet: boolean }): DropdownOption[] => [
	{
		element: (
			<NetworkDropdownOption isSelected={isMainnet}>
				<MainnetOption />
			</NetworkDropdownOption>
		),
		label: "",
		value: NetworkOption.Mainnet,
	},
	{
		element: (
			<NetworkDropdownOption isSelected={!isMainnet}>
				<TestnetOption />
			</NetworkDropdownOption>
		),
		label: "",
		value: NetworkOption.Testnet,
	},
];
