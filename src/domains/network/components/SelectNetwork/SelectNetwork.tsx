import { Networks } from "@payvo/sdk";
import cn from "classnames";
import { useCombobox } from "downshift";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { SelectNetworkInput } from "./SelectNetworkInput";
import { Divider } from "@/app/components/Divider";
import { NetworkOption, NetworkOptions } from "@/domains/network/components/NetworkOptions";
import { networkDisplayName } from "@/utils/network-utils";

interface SelectNetworkProperties {
	autoFocus?: boolean;
	disabled?: boolean;
	hideOptions?: boolean;
	id?: string;
	name?: string;
	networks: Networks.Network[];
	onInputChange?: (value?: string, suggestion?: string) => void;
	onSelect?: (network?: Networks.Network | null) => void;
	placeholder?: string;
	selected?: Networks.Network;
	value?: string;
}

export const itemToString = (item: Networks.Network | null) => networkDisplayName(item) || "";

const defaultProps = {
	networks: [],
};

export const SelectNetwork = ({
	autoFocus,
	disabled = false,
	hideOptions,
	id,
	name,
	networks = defaultProps.networks,
	onInputChange,
	onSelect,
	placeholder,
	selected,
}: SelectNetworkProperties) => {
	const { t } = useTranslation();

	const [suggestion, setSuggestion] = useState("");

	const isMatch = (inputValue: string, network: Networks.Network) =>
		inputValue && networkDisplayName(network).toLowerCase().startsWith(inputValue.toLowerCase());

	const {
		openMenu,
		getComboboxProps,
		getLabelProps,
		getInputProps,
		getMenuProps,
		selectItem,
		selectedItem,
		inputValue,
		reset,
	} = useCombobox<Networks.Network | null>({
		id,
		itemToString,
		items: networks,
		onInputValueChange: ({ inputValue, selectedItem }) => {
			// Clear selection when user is changing input,
			// and input does not match previously selected item
			if (selectedItem && networkDisplayName(selectedItem) !== inputValue) {
				reset();
			}

			if (!inputValue) {
				setSuggestion("");
				return onInputChange?.();
			}

			let newSuggestion = "";

			if (inputValue !== networkDisplayName(selectedItem)) {
				const matches = networks.filter((network: Networks.Network) => isMatch(inputValue, network));

				if (matches.length > 0) {
					newSuggestion = [inputValue, networkDisplayName(matches[0]).slice(inputValue.length)].join("");
				}
			}

			setSuggestion(newSuggestion);

			onInputChange?.(inputValue, newSuggestion);
		},
		onSelectedItemChange: ({ selectedItem }) => {
			setSuggestion("");

			onSelect?.(selectedItem);
		},
	});

	useEffect(() => {
		selectItem(selected || null);
	}, [selectItem, selected, disabled]);

	const toggleSelection = useCallback(
		(item: Networks.Network) => {
			if (item.id() === selectedItem?.id()) {
				setSuggestion("");
				reset();
				openMenu();
				return;
			}
			selectItem(item);
		},
		[openMenu, reset, selectItem, selectedItem],
	);

	const publicNetworks = networks.filter((network) => network.isLive());
	const developmentNetworks = networks.filter((network) => network.isTest());

	const optionClassName = useCallback(
		(network: Networks.Network) => {
			if (selectedItem) {
				// `network` is the selected item

				if (networkDisplayName(selectedItem) === networkDisplayName(network)) {
					return "border-theme-primary-500 dark:border-theme-primary-600 bg-theme-primary-100 dark:bg-theme-primary-900 text-theme-secondary-600 dark:text-theme-secondary-200";
				}

				return;
			}

			// no input or input matches `network`
			if (!inputValue || isMatch(inputValue, network)) {
				return;
			}

			// input does not match `network`
			return "text-theme-secondary-500 dark:text-theme-secondary-800 border-theme-primary-100 dark:border-theme-secondary-800";
		},
		[inputValue, selectedItem],
	);

	const hasPublicNetworks = publicNetworks.length > 0;
	const hasDevelopmentNetworks = developmentNetworks.length > 0;

	const renderNetworks = useCallback(
		(network: Networks.Network[]) =>
			network.map((network: Networks.Network, index: number) => (
				<NetworkOption
					key={index}
					disabled={disabled}
					network={network}
					iconClassName={optionClassName(network)}
					onClick={() => toggleSelection(network)}
				/>
			)),
		[disabled, optionClassName, toggleSelection],
	);

	return (
		<div>
			<div data-testid="SelectNetwork" {...getComboboxProps()}>
				<label {...getLabelProps()} />
				<SelectNetworkInput
					autoFocus={autoFocus}
					network={selectedItem}
					suggestion={suggestion}
					disabled={disabled}
					{...getInputProps({
						name,
						onFocus: openMenu,
						onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
							if (event.key === "Enter") {
								const firstMatch = networks.find((network: Networks.Network) =>
									isMatch(inputValue, network),
								);
								if (inputValue && firstMatch) {
									selectItem(firstMatch);
								}

								event.preventDefault();
							}
						},
						placeholder: placeholder || t("COMMON.INPUT_NETWORK.PLACEHOLDER"),
					})}
				/>
			</div>

			<div data-testid="SelectNetwork__options" className={cn({ hidden: hideOptions })}>
				<div className={cn("mt-6", { hidden: !hasPublicNetworks })}>
					{hasDevelopmentNetworks && (
						<div className="text-sm font-bold text-theme-secondary-400 dark:text-theme-secondary-700">
							{t("COMMON.PUBLIC_NETWORKS").toUpperCase()}
						</div>
					)}

					<NetworkOptions {...getMenuProps()}>{renderNetworks(publicNetworks)}</NetworkOptions>
				</div>

				{hasPublicNetworks && hasDevelopmentNetworks && <Divider dashed />}

				{hasDevelopmentNetworks && (
					<div className="mt-6">
						{hasPublicNetworks && (
							<span className="text-sm font-bold text-theme-secondary-400 dark:text-theme-secondary-700">
								{t("COMMON.DEVELOPMENT_NETWORKS").toUpperCase()}
							</span>
						)}

						<NetworkOptions {...getMenuProps()}>{renderNetworks(developmentNetworks)}</NetworkOptions>
					</div>
				)}
			</div>
		</div>
	);
};
