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
		<span className="border-theme-primary-300 bg-theme-primary-50 text-theme-primary-600 dark:border-theme-primary-500 dark:bg-theme-dark-900 rounded-xs border-2 p-[3px]">
			<Icon name="Mainnet" width={14} height={14} />
		</span>

		<span className="text-theme-secondary-700 group-hover:text-theme-secondary-900 dark:text-theme-dark-200 dark:group-hover:text-theme-dark-50 text-sm">
			Mainnet
		</span>
	</>
);

export const TestnetOption = () => (
	<>
		<span className="border-theme-warning-300 bg-theme-warning-50 text-theme-warning-600 dark:border-theme-danger-info-border dark:text-theme-danger-info-text rounded-xs border-2 p-[3px] dark:bg-transparent">
			<Icon name="Testnet" width={14} height={14} />
		</span>

		<span className="text-theme-secondary-700 group-hover:text-theme-secondary-900 dark:text-theme-dark-200 dark:group-hover:text-theme-dark-50 text-sm">
			Testnet
		</span>
	</>
);

export const NetworkDropdownOption = ({ isSelected, children }: { isSelected?: boolean; children: ReactElement }) => (
	<div className={cn("flex min-w-40 items-center justify-between")}>
		<div className="flex items-center space-x-2">{children}</div>

		{isSelected && <Icon name="CheckmarkDouble" className="text-theme-primary-600 dark:text-theme-text" />}
	</div>
);

export const SelectNetworkToggleButton = ({ isOpen, isMainnet }: { isOpen?: boolean; isMainnet?: boolean }) => (
	<div className="group">
		<Button
			className="text-theme-secondary-700 group-hover:bg-theme-secondary-200 dark:text-theme-secondary-600 dark:group-hover:bg-theme-dark-700 w-auto p-1"
			data-testid="NavigationBar__buttons--network"
			size="icon"
			variant="transparent"
		>
			{isMainnet && <MainnetOption />}

			{!isMainnet && <TestnetOption />}

			<Icon
				role="img"
				name="ChevronDownSmall"
				className={cn(
					"text-theme-secondary-700 group-hover:text-theme-secondary-900 dark:text-theme-dark-200 dark:group-hover:text-theme-dark-50 transition-transform",
					{
						"rotate-180": isOpen,
					},
				)}
				size="sm"
			/>
		</Button>
	</div>
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
