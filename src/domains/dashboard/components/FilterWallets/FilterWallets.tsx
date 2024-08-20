import cn from "classnames";
import React from "react";
import { useTranslation } from "react-i18next";

import { FilterWalletsProperties } from "./FilterWallets.contracts";
import { Dropdown } from "@/app/components/Dropdown/Dropdown";
import { FilterNetworks } from "@/app/components/FilterNetwork";
import { Icon } from "@/app/components/Icon";

export const FilterWallets = ({ networks, walletsDisplayType, onChange }: FilterWalletsProperties) => {
	const { t } = useTranslation();

	const walletDisplayOptions = [
		{ label: t("COMMON.ALL"), value: "all" },
		{ label: t("COMMON.STARRED"), value: "starred" },
		{ label: t("COMMON.LEDGER"), value: "ledger" },
	];

	return (
		<div className="flex flex-col text-left" data-testid="FilterWallets">
			<div className="mb-6">
				<div className="font-semibold text-theme-secondary-text">
					{t("DASHBOARD.FILTER_WALLETS.CRYPTOASSET.TITLE")}
				</div>
				<div className="mt-1 text-sm text-theme-secondary-500 font-semibold">
					{t("DASHBOARD.FILTER_WALLETS.CRYPTOASSET.DESCRIPTION")}
				</div>
			</div>

			<FilterNetworks
				options={networks}
				onChange={(_: any, options: any[]) => {
					onChange?.(
						"selectedNetworkIds",
						options.filter((option) => option.isSelected).map((option) => option.network.id()),
					);
				}}
			/>

			<div className="mb-6 mt-2 border-t border-dotted border-theme-secondary-300 dark:border-theme-secondary-800" />

			<div className="flex flex-col">
				<div className="flex items-center justify-between">
					<div>
						<div className="font-semibold text-theme-secondary-text">
							{t("DASHBOARD.FILTER_WALLETS.WALLETS.TITLE")}
						</div>

						<div className="mt-2 pr-12 text-sm text-theme-secondary-500 font-semibold">
							{t("DASHBOARD.FILTER_WALLETS.WALLETS.DESCRIPTION")}
						</div>
					</div>
				
					<Dropdown
						dropdownClass="mx-4 sm:mx-0"
						toggleIcon="ChevronDownSmall"
						toggleSize="sm"
						options={walletDisplayOptions}
						onSelect={({ value }) => onChange?.("walletsDisplayType", value)}
						toggleContent={(isOpen: boolean) => (
							<div
								data-testid="filter-wallets__wallets"
								className="flex cursor-pointer items-center justify-end text-theme-secondary-text"
							>
								<span className="mr-2 inline-block font-semibold">
									{walletDisplayOptions.find((option) => option.value === walletsDisplayType)?.label}
								</span>
								<Icon
									name="ChevronDownSmall"
									className={cn("transition-transform", { "rotate-180": isOpen })}
									size="sm"
								/>
							</div>
						)}
					/>
				</div>

	
			</div>
		</div>
	);
};
