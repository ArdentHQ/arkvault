import { AddressViewSelection, AddressViewType, useAddressesPanel } from "@/domains/portfolio/hooks/use-address-panel";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Tab, TabList, Tabs } from "@/app/components/Tabs";
import { useBreakpoint, useWalletAlias } from "@/app/hooks";

import { AddressRow } from "@/domains/portfolio/components/AddressesSidePanel/AddressRow";
import { Button } from "@/app/components/Button";
import { Checkbox } from "@/app/components/Checkbox";
import { Contracts } from "@ardenthq/sdk-profiles";
import { DeleteAddressMessage } from "@/domains/portfolio/components/AddressesSidePanel/DeleteAddressMessage";
import { Icon } from "@/app/components/Icon";
import { Input } from "@/app/components/Input";
import { SidePanel } from "@/app/components/SidePanel/SidePanel";
import { TabId } from "@/app/components/Tabs/useTab";
import { Tooltip } from "@/app/components/Tooltip";
import cn from "classnames";
import { t } from "i18next";
import { useLocalStorage } from "usehooks-ts";
import { usePortfolio } from "@/domains/portfolio/hooks/use-portfolio";

export const AddressesSidePanel = ({
	profile,
	wallets,
	defaultSelectedAddresses = [],
	defaultSelectedWallet,
	open,
	onOpenChange,
	onClose,
	onDelete,
}: {
	profile: Contracts.IProfile;
	wallets: Contracts.IReadWriteWallet[];
	defaultSelectedAddresses: string[];
	defaultSelectedWallet?: Contracts.IReadWriteWallet;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onClose: (addresses: string[]) => void;
	onDelete?: (addresses: string) => void;
}): JSX.Element => {
	const {
		addressViewPreference,
		singleSelectedAddress,
		multiSelectedAddresses,
		setAddressViewPreference,
		setSingleSelectedAddress,
		setMultiSelectedAddresses,
	} = useAddressesPanel({ profile });

	const { selectedAddresses: selectedAddressesFromPortfolio } = usePortfolio({ profile });

	const [isAnimating, setIsAnimating] = useState(false);
	const [isDeleteMode, setDeleteMode] = useState<boolean>(false);
	const [addressToDelete, setAddressToDelete] = useState<string | undefined>(undefined);
	const [showManageHint, setShowManageHint] = useState<boolean>(false);
	const [manageHintHasShown, persistManageHint] = useLocalStorage("manage-hint", false);
	const [searchQuery, setSearchQuery] = useState<string>("");

	const [activeMode, setActiveMode] = useState<AddressViewType>(addressViewPreference);
	const [selectedAddresses, setSelectedAddresses] = useState<string[]>(
		activeMode === AddressViewSelection.single ? singleSelectedAddress : multiSelectedAddresses,
	);

	/* istanbul ignore next -- @preserve */
	const { isXs } = useBreakpoint();

	const tabOptions = [
		{
			active: activeMode === AddressViewSelection.single,
			label: t("WALLETS.ADDRESSES_SIDE_PANEL.TOGGLE.SINGLE_VIEW"),
			value: AddressViewSelection.single,
		},
		{
			active: activeMode === AddressViewSelection.multiple,
			label: t("WALLETS.ADDRESSES_SIDE_PANEL.TOGGLE.MULTIPLE_VIEW"),
			value: AddressViewSelection.multiple,
		},
	];

	const handleViewToggle = async (newMode: AddressViewType) => {
		if (newMode === activeMode) {
			return;
		}

		if (activeMode === AddressViewSelection.multiple) {
			// Switching from multiple to single
			await setMultiSelectedAddresses(selectedAddresses);

			let newSelection: string[] = [];
			if (singleSelectedAddress.length > 0) {
				newSelection = singleSelectedAddress;
			} else if (selectedAddresses.length > 0) {
				newSelection = [selectedAddresses[0]];
			} else if (defaultSelectedWallet) {
				newSelection = [defaultSelectedWallet.address()];
			}

			setSelectedAddresses(newSelection);
			await setSingleSelectedAddress(newSelection);
		} else {
			// Switching from single to multiple
			await setSingleSelectedAddress(selectedAddresses);

			let newSelection: string[];

			if (multiSelectedAddresses.length > 0) {
				newSelection = multiSelectedAddresses;
			} else if (selectedAddresses.length > 0) {
				newSelection = selectedAddresses;
			} else {
				newSelection = defaultSelectedAddresses;
			}

			setSelectedAddresses(newSelection);
			await setMultiSelectedAddresses(newSelection);
		}

		setActiveMode(newMode);
		await setAddressViewPreference(newMode);
	};

	const activeModeChangeHandler = useCallback(
		(activeTab: TabId) => {
			handleViewToggle(activeTab as AddressViewType);
		},
		[activeMode, selectedAddresses, multiSelectedAddresses, singleSelectedAddress],
	);

	const toggleAddressSelection = async (address: string) => {
		if (isDeleteMode) {
			return;
		}

		if (activeMode === AddressViewSelection.single) {
			setSelectedAddresses([address]);
			await setSingleSelectedAddress([address]);
		} else {
			if (selectedAddresses.includes(address)) {
				const newSelection = selectedAddresses.filter((a) => a !== address);
				setSelectedAddresses(newSelection);
				await setMultiSelectedAddresses(newSelection);
			} else {
				const newSelection = [...selectedAddresses, address];
				setSelectedAddresses(newSelection);
				await setMultiSelectedAddresses(newSelection);
			}
		}
	};

	useEffect(() => {
		const handleSingleViewInitialization = async () => {
			if (singleSelectedAddress.length > 0) {
				setSelectedAddresses(singleSelectedAddress);
				return;
			}

			const addressToUse = findFirstAvailableAddress();

			if (addressToUse) {
				setSelectedAddresses([addressToUse]);
				await setSingleSelectedAddress([addressToUse]);
			}
		};

		const findFirstAvailableAddress = () =>
			defaultSelectedWallet?.address() ||
			defaultSelectedAddresses[0] ||
			(wallets.length > 0 ? wallets[0].address() : undefined);

		const handleMultipleViewInitialization = async () => {
			if (multiSelectedAddresses.length === 0 && defaultSelectedAddresses.length > 0) {
				setSelectedAddresses(defaultSelectedAddresses);
				await setMultiSelectedAddresses(defaultSelectedAddresses);
			} else {
				setSelectedAddresses(multiSelectedAddresses);
			}
		};

		const initializeAddresses = async () => {
			if (activeMode === AddressViewSelection.single) {
				await handleSingleViewInitialization();
			} else if (activeMode === AddressViewSelection.multiple) {
				await handleMultipleViewInitialization();
			}
		};

		initializeAddresses();
	}, []);

	// Reset selected addresses when panel closes
	useEffect(() => {
		if (open) {
			setSelectedAddresses(selectedAddressesFromPortfolio);
		} else {
			setSelectedAddresses(
				activeMode === AddressViewSelection.single ? singleSelectedAddress : multiSelectedAddresses,
			);
		}
	}, [open]);

	// Sync local state with hook state when they change
	useEffect(() => {
		if (activeMode === AddressViewSelection.single) {
			setSelectedAddresses(singleSelectedAddress);
		} else {
			setSelectedAddresses(multiSelectedAddresses);
		}
	}, [activeMode, singleSelectedAddress, multiSelectedAddresses]);

	useEffect(() => {
		const singleSelectedAddressIsInWallets = singleSelectedAddress.some((address) =>
			wallets.some((w) => w.address() === address),
		);

		if (!singleSelectedAddressIsInWallets) {
			void setSingleSelectedAddress([wallets[0].address()]);
		}

		const selectedMultiAddressesInWallets = multiSelectedAddresses.filter((address) =>
			wallets.some((w) => w.address() === address),
		);

		if (selectedMultiAddressesInWallets.length !== multiSelectedAddresses.length) {
			void setMultiSelectedAddresses(selectedMultiAddressesInWallets);
		}
	}, [wallets, singleSelectedAddress, multiSelectedAddresses]);

	useEffect(() => {
		if (!open || manageHintHasShown) {
			setShowManageHint(false);
			return;
		}

		const id = setTimeout(() => {
			setShowManageHint(true);
		}, 1000);

		return () => {
			clearTimeout(id);
		};
	}, [manageHintHasShown, open]);

	const resetDeleteState = () => {
		setAddressToDelete(undefined);
		setDeleteMode(false);
	};

	const { getWalletAlias } = useWalletAlias();

	const addressesToShow = wallets.filter((wallet) => {
		if (!searchQuery) {
			return true;
		}

		const query = searchQuery.toLowerCase();

		const { alias } = getWalletAlias({ address: wallet.address(), network: wallet.network(), profile });

		return wallet.address().toLowerCase().startsWith(query) || (alias && alias.toLowerCase().includes(query));
	});

	const isSelectAllDisabled = isDeleteMode || addressesToShow.length === 0;
	const isSelected = (wallet: Contracts.IReadWriteWallet) => selectedAddresses.includes(wallet.address());
	const hasSelectedAddresses = () => selectedAddresses.length > 0;

	const runErrorAnimation = () => {
		setIsAnimating(true);
		setTimeout(() => setIsAnimating(false), 900);
	};

	return (
		<SidePanel
			className={cn({ "animate-shake": isAnimating })}
			header={t("WALLETS.ADDRESSES_SIDE_PANEL.TITLE")}
			open={open}
			onOpenChange={(open) => {
				if (selectedAddresses.length === 0) {
					runErrorAnimation();
					return;
				}

				resetDeleteState();
				onOpenChange(open);
				setSearchQuery("");

				if (!open) {
					onClose(selectedAddresses);
				}
			}}
			dataTestId="AddressesSidePanel"
		>
			<Tabs
				className={cn("mb-3", { hidden: wallets.length === 1 })}
				activeId={activeMode}
				onChange={activeModeChangeHandler}
			>
				<TabList className="grid h-10 w-full grid-cols-2">
					{tabOptions.map((option) => (
						<Tab tabId={option.value} key={option.value} className="">
							<span>{option.label}</span>
						</Tab>
					))}
				</TabList>
			</Tabs>

			<Input
				placeholder={t("WALLETS.ADDRESSES_SIDE_PANEL.SEARCH_BY")}
				innerClassName="font-normal"
				value={searchQuery}
				data-testid="AddressesPanel--SearchInput"
				ignoreContext
				onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchQuery(event.target.value)}
				noShadow
				addons={{
					start: { content: <Icon name="MagnifyingGlassAlt" className="text-theme-secondary-500" /> },
				}}
			/>

			<div className="-mx-3 my-3 rounded-r-sm border-l-2 border-theme-info-400 bg-theme-secondary-100 px-3 py-2.5 dark:bg-theme-dark-950 sm:mx-0 sm:border-none sm:bg-transparent sm:p-0 sm:dark:bg-transparent">
				<div
					className={cn("flex sm:px-4", {
						"justify-between": activeMode === AddressViewSelection.multiple,
						"justify-end": activeMode === AddressViewSelection.single,
					})}
				>
					<label
						data-testid="SelectAllAddresses"
						className={cn(
							"flex cursor-pointer items-center space-x-3 text-sm leading-[17px] sm:text-base sm:leading-5",
							{
								hidden: activeMode === AddressViewSelection.single,
								"text-theme-secondary-500 dark:text-theme-dark-500": isSelectAllDisabled,
								"text-theme-secondary-700 hover:text-theme-primary-600 dark:text-theme-dark-200 hover:dark:text-theme-primary-500":
									!isSelectAllDisabled,
							},
						)}
					>
						<Checkbox
							name="all"
							disabled={isSelectAllDisabled}
							data-testid="SelectAllAddresses_Checkbox"
							checked={!isSelectAllDisabled && selectedAddresses.length === addressesToShow.length}
							onChange={async () => {
								if (selectedAddresses.length === addressesToShow.length) {
									setSelectedAddresses([]);
									await setMultiSelectedAddresses([]);
								} else {
									const allAddresses = addressesToShow.map((w) => w.address());
									setSelectedAddresses(allAddresses);
									await setMultiSelectedAddresses(allAddresses);
								}
							}}
						/>
						<span className="font-semibold">{t("COMMON.SELECT_ALL")}</span>
					</label>

					{!isDeleteMode && (
						<Tooltip
							visible={showManageHint}
							interactive={true}
							/* istanbul ignore next -- @preserve */
							maxWidth={isXs ? 264 : "none"}
							content={
								<div className="px-[3px] pb-1.5 text-sm leading-5 sm:space-x-4 sm:pb-px sm:pt-px">
									<span className="mb-2 block sm:mb-0 sm:inline">
										{t("WALLETS.ADDRESSES_SIDE_PANEL.MANAGE_HINT")}
									</span>
									<Button
										size="xs"
										variant="transparent"
										data-testid="HideManageHint"
										className="w-full bg-theme-primary-500 px-4 py-1.5 sm:w-auto"
										onClick={() => {
											persistManageHint(true);
											setShowManageHint(false);
										}}
									>
										{t("COMMON.GOT_IT")}
									</Button>
								</div>
							}
							placement="bottom-end"
						>
							<Button
								data-testid="ManageAddresses"
								size="icon"
								variant="primary-transparent"
								onClick={() => setDeleteMode(true)}
								className={cn(
									"p-2 py-[3px] text-sm leading-[18px] text-theme-primary-600 dark:text-theme-primary-400 sm:text-base sm:leading-5",
									{
										"ring ring-theme-primary-400 ring-offset-4 ring-offset-theme-secondary-100 dark:ring-theme-primary-800 dark:ring-offset-theme-dark-950 sm:ring-offset-transparent dark:sm:ring-offset-transparent":
											showManageHint,
									},
								)}
							>
								<Icon name="Gear" size="lg" dimensions={[16, 16]} />
								<span>{t("COMMON.MANAGE")}</span>
							</Button>
						</Tooltip>
					)}

					{isDeleteMode && (
						<div className="flex items-center space-x-2 px-2 leading-[18px] sm:leading-5">
							<Button
								data-testid="BackManage"
								size="icon"
								variant="primary-transparent"
								onClick={resetDeleteState}
								className="p-2 py-[3px] text-sm leading-[18px] text-theme-primary-600 dark:text-theme-primary-400 sm:text-base sm:leading-5"
							>
								<Icon name="Back" dimensions={[16, 16]} />
								<span>{t("COMMON.BACK")}</span>
							</Button>
						</div>
					)}
				</div>
			</div>

			{isDeleteMode && (
				<div className="my-2 flex flex-col overflow-hidden rounded bg-theme-info-50 dark:bg-theme-dark-800 sm:my-3 sm:flex-row sm:items-center sm:rounded-xl">
					<div className="flex w-full items-center space-x-2 bg-theme-info-100 px-4 py-2 dark:bg-theme-info-600 sm:w-auto sm:space-x-0 sm:py-4.5">
						<Icon name="CircleInfo" className="text-theme-info-700 dark:text-white" dimensions={[16, 16]} />
						<span className="text-sm font-semibold leading-[17px] text-theme-info-700 dark:text-white sm:hidden">
							{t("COMMON.INFORMATION")}
						</span>
					</div>
					<div className="p-4 text-sm text-theme-secondary-900 dark:text-theme-dark-50">
						{t("WALLETS.ADDRESSES_SIDE_PANEL.DELETE_INFO")}
					</div>
				</div>
			)}

			<div className="space-y-1">
				{addressesToShow.map((wallet, index) => (
					<AddressRow
						profile={profile}
						errorMessage={
							!hasSelectedAddresses() && !isDeleteMode && index === 0
								? "You need to have at least one address selected."
								: undefined
						}
						isError={(!hasSelectedAddresses() && !isDeleteMode) || wallet.address() === addressToDelete}
						key={wallet.address()}
						wallet={wallet}
						toggleAddress={toggleAddressSelection}
						isSelected={isSelected(wallet)}
						isSingleView={activeMode === AddressViewSelection.single}
						usesDeleteMode={isDeleteMode}
						onDelete={(address: string) => setAddressToDelete(address)}
						deleteContent={
							addressToDelete === wallet.address() ? (
								<DeleteAddressMessage
									onCancelDelete={resetDeleteState}
									onConfirmDelete={() => onDelete?.(wallet.address())}
								/>
							) : undefined
						}
					/>
				))}
			</div>
		</SidePanel>
	);
};
