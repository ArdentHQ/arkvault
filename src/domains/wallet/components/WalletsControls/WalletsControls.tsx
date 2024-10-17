import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Icon } from "@/app/components//Icon";
import { Button } from "@/app/components/Button";
import { ControlButton } from "@/app/components/ControlButton";
import { Dropdown, DropdownOption } from "@/app/components/Dropdown";
import { Tooltip } from "@/app/components/Tooltip";
import { FilterWallets, FilterWalletsHookProperties } from "@/domains/dashboard/components/FilterWallets";
import { Divider } from "@/app/components/Divider";
import { isLedgerTransportSupported } from "@/app/contexts/Ledger/transport";

enum NewWalletOption {
	Create,
	Import,
}

interface WalletsControlsProperties {
	filterProperties: FilterWalletsHookProperties;
	onCreateWallet: (event?: React.MouseEvent<HTMLElement>) => void;
	onImportWallet: (event?: React.MouseEvent<HTMLElement>) => void;
	onImportLedgerWallet?: () => void;
	onFilterChange?: (key: string, value: any) => void;
}

export const WalletsControls = React.memo(
	({
		filterProperties,
		onCreateWallet,
		onImportWallet,
		onImportLedgerWallet,
		onFilterChange,
	}: WalletsControlsProperties) => {
		const { t } = useTranslation();

		const newWalletOptions = useMemo<DropdownOption[]>(
			() => [
				{
					icon: "Plus",
					iconPosition: "start",
					label: t("WALLETS.PAGE_CREATE_WALLET.TITLE"),
					value: NewWalletOption.Create,
				},
				{
					icon: "ArrowTurnDownBracket",
					iconPosition: "start",
					label: t("WALLETS.PAGE_IMPORT_WALLET.TITLE"),
					value: NewWalletOption.Import,
				},
			],
			[t],
		);

		const handleNewWallet = useCallback(
			(option: DropdownOption) => {
				if (option.value === NewWalletOption.Create) {
					onCreateWallet();
				}

				if (option.value === NewWalletOption.Import) {
					onImportWallet();
				}
			},
			[onCreateWallet, onImportWallet],
		);

		return (
			<div data-testid="WalletControls" className="flex items-center justify-end">
				<div className="static mr-0 flex items-center border-theme-secondary-300 pr-0 text-theme-primary-300 dark:border-theme-secondary-800 dark:text-theme-secondary-600 sm:mr-8 sm:border-r sm:pr-5 md:relative">
					<Dropdown
						position="bottom"
						dropdownClass="mx-4 md:mx-0"
						toggleContent={
							<Tooltip content={filterProperties.disabled ? t("COMMON.NOTICE_NO_WALLETS") : undefined}>
								<span>
									<ControlButton
										isChanged={filterProperties.isFilterChanged}
										disabled={filterProperties.disabled}
									>
										<div className="flex h-5 w-5 items-center justify-center">
											<Icon name="SlidersVertical" size="lg" />
										</div>
									</ControlButton>
								</span>
							</Tooltip>
						}
						disableToggle={filterProperties.disabled}
					>
						<div className="w-full px-10 py-7 sm:w-96 md:w-128">
							<FilterWallets {...filterProperties} onChange={onFilterChange} />
						</div>
					</Dropdown>
				</div>

				<div className="flex sm:hidden">
					<Divider type="vertical" size="md" />
				</div>

				<div className="hidden gap-3 sm:flex">
					<Tooltip content={isLedgerTransportSupported() ? "" : t("COMMON.LEDGER_COMPATIBILITY_ERROR")}>
						<div>
							<Button
								disabled={!isLedgerTransportSupported()}
								onClick={onImportLedgerWallet}
								variant="secondary"
								className="hidden md:inline-flex"
								data-testid="WalletControls__import-ledger"
							>
								<div className="flex items-center space-x-2">
									<Icon name="Ledger" />
									<span className="hidden lg:inline">
										{t("DASHBOARD.WALLET_CONTROLS.IMPORT_LEDGER")}
									</span>
								</div>
							</Button>
						</div>
					</Tooltip>

					<Button onClick={onImportWallet} variant="secondary" data-testid="WalletControls__import-wallet">
						<div className="flex items-center space-x-2">
							<Icon name="ArrowTurnDownBracket" />
							<span>{t("DASHBOARD.WALLET_CONTROLS.IMPORT")}</span>
						</div>
					</Button>

					<Button onClick={onCreateWallet} variant="primary" data-testid="WalletControls__create-wallet">
						<div className="flex items-center space-x-2">
							<Icon name="Plus" />
							<span>{t("DASHBOARD.WALLET_CONTROLS.CREATE")}</span>
						</div>
					</Button>
				</div>

				<div className="flex items-center sm:hidden">
					<Dropdown
						dropdownClass="mx-4 md:mx-0"
						toggleContent={
							<span className="-mx-1 flex items-center px-5 py-3 text-theme-primary-300 dark:text-theme-secondary-600">
								<Icon name="Plus" />
							</span>
						}
						options={newWalletOptions}
						onSelect={handleNewWallet}
					/>
				</div>
			</div>
		);
	},
);

WalletsControls.displayName = "WalletsControls";
