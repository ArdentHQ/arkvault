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
		<span className="rounded-xs border-2 border-theme-primary-300 bg-theme-primary-50 p-[3px] text-theme-primary-600 dark:border-theme-primary-500 dark:bg-theme-dark-900">
			<Icon name="Mainnet" width={14} height={14} />
		</span>

		<span className="text-sm text-theme-secondary-700 group-hover:text-theme-secondary-900 dark:text-theme-dark-200 dark:group-hover:text-theme-dark-50">
			Mainnet
		</span>
	</>
);

export const TestnetOption = () => (
	<>
		<span className="rounded-xs border-2 border-theme-warning-300 bg-theme-warning-50 p-[3px] text-theme-warning-600 dark:border-theme-danger-info-border dark:bg-transparent dark:text-theme-danger-info-text">
			<Icon name="Testnet" width={14} height={14} />
		</span>

		<span className="text-sm text-theme-secondary-700 group-hover:text-theme-secondary-900 dark:text-theme-dark-200 dark:group-hover:text-theme-dark-50">
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
			className="w-auto p-1 text-theme-secondary-700 group-hover:bg-theme-secondary-200 dark:text-theme-secondary-600 dark:group-hover:bg-theme-dark-700"
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
					"text-theme-secondary-700 transition-transform group-hover:text-theme-secondary-900 dark:text-theme-dark-200 dark:group-hover:text-theme-dark-50",
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
