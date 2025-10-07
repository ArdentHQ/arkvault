import React, { ChangeEvent, useEffect, useState, JSX } from "react";
import { Tab, TabList, Tabs } from "@/app/components/Tabs";
import { useActiveProfile, useBreakpoint, useWalletAlias } from "@/app/hooks";

import { AddressRow } from "@/domains/portfolio/components/AddressesSidePanel/AddressRow";
import { Button } from "@/app/components/Button";
import { Checkbox } from "@/app/components/Checkbox";
import { DeleteAddressMessage } from "@/domains/portfolio/components/AddressesSidePanel/DeleteAddressMessage";
import { Icon } from "@/app/components/Icon";
import { Input } from "@/app/components/Input";
import { SidePanel } from "@/app/components/SidePanel/SidePanel";
import { Tooltip } from "@/app/components/Tooltip";
import cn from "classnames";
import { t } from "i18next";
import { useLocalStorage } from "usehooks-ts";
import { EmptyBlock } from "@/app/components/EmptyBlock";
import { UpdateAddressName } from "@/domains/portfolio/components/AddressesSidePanel/UpdateAddressName";
import { ProfileSetting } from "@/app/lib/profiles/profile.enum.contract";
import { useWalletSelection } from "@/domains/portfolio/hooks/use-wallet-selection";
import { AddressViewSelection, AddressViewType } from "@/app/lib/profiles/wallet.enum";

export const AddressesSidePanel = ({
	open,
	onClose,
	onOpenChange,
	onMountChange,
}: {
	open: boolean;
	onClose?: () => void;
	onOpenChange: (open: boolean) => void;
	onMountChange?: (mounted: boolean) => void;
}): JSX.Element => {
	/* istanbul ignore next -- @preserve */
	const { isXs } = useBreakpoint();

	const profile = useActiveProfile();

	const [isManageMode, setManageMode] = useState<boolean>(false);
	const [addressToDelete, setAddressToDelete] = useState<string | undefined>(undefined);
	const [addressToEdit, setAddressToEdit] = useState<string | undefined>(undefined);
	const [showManageHint, setShowManageHint] = useState<boolean>(false);
	const [manageHintHasShown, persistManageHint] = useLocalStorage("manage-hint", false);
	const [searchQuery, setSearchQuery] = useState<string>("");

	const { getWalletAlias } = useWalletAlias();

	const {
		handleDelete,
		persistSelection,
		toggleSelection,
		activeMode,
		setActiveMode,
		setSelectedAddresses,
		selectedAddresses,
	} = useWalletSelection(profile);

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

	const closeSidepanel = async (selected: string[]) => {
		persistSelection(selected);
		onOpenChange(false);
		onClose?.();
	};

	const disableManageState = () => {
		setAddressToDelete(undefined);
		setAddressToEdit(undefined);
		setManageMode(false);
	};

	const addressesToShow = profile
		.wallets()
		.values()
		.filter((wallet) => {
			if (!searchQuery) {
				return true;
			}

			const query = searchQuery.toLowerCase();
			const { alias } = getWalletAlias({ address: wallet.address(), network: wallet.network(), profile });

			return wallet.address().toLowerCase().startsWith(query) || (alias && alias.toLowerCase().includes(query));
		});

	const isSelectAllDisabled = isManageMode || addressesToShow.length === 0;

	return (
		<SidePanel
			title={t("WALLETS.ADDRESSES_SIDE_PANEL.TITLE")}
			open={open}
			onOpenChange={(open) => {
				disableManageState();
				onOpenChange(open);
				setSearchQuery("");

				if (!open) {
					closeSidepanel(selectedAddresses);
				}
			}}
			shakeWhenClosing={selectedAddresses.length === 0}
			preventClosing={selectedAddresses.length === 0}
			dataTestId="AddressesSidePanel"
			onMountChange={onMountChange}
			minimizeable={false}
		>
			<Tabs
				className={cn("mb-3", { hidden: profile.wallets().count() === 1 })}
				activeId={activeMode}
				onChange={(activeTab) => {
					setActiveMode(activeTab as AddressViewType);
					profile.settings().set(ProfileSetting.WalletSelectionMode, activeTab as AddressViewType);
					setSelectedAddresses(
						profile
							.wallets()
							.selected()
							.map((wallet) => wallet.address()),
					);
				}}
				disabled={isManageMode}
			>
				<TabList className="grid h-10 w-full grid-cols-2">
					{tabOptions.map((option) => (
						<Tab tabId={option.value} key={option.value} className="px-2.5 sm:px-3">
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
					start: {
						content: (
							<Icon
								name="MagnifyingGlassAlt"
								className="text-theme-secondary-500 dim:text-theme-dim-500"
							/>
						),
					},
				}}
			/>

			<div className="border-theme-info-400 bg-theme-secondary-100 dark:bg-theme-dark-950 dim:border-theme-dim-navy-400 dim:bg-theme-dim-950 dim:sm:bg-transparent -mx-3 my-3 rounded-r-sm border-l-2 px-3 py-2.5 sm:mx-0 sm:border-none sm:bg-transparent sm:p-0 sm:dark:bg-transparent">
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
								"text-theme-secondary-500 dark:text-theme-dark-500 dim:text-theme-dim-500":
									isSelectAllDisabled,
								"text-theme-secondary-700 hover:text-theme-primary-600 dark:text-theme-dark-200 dark:hover:text-theme-primary-500 dim:text-theme-dim-200 dim-hover:text-theme-dim-50":
									!isSelectAllDisabled,
							},
						)}
					>
						<Checkbox
							name="all"
							disabled={isSelectAllDisabled}
							data-testid="SelectAllAddresses_Checkbox"
							checked={!isSelectAllDisabled && selectedAddresses.length === addressesToShow.length}
							onChange={() => {
								const areAllSelected = selectedAddresses.length === addressesToShow.length;
								const newSelection = areAllSelected ? [] : addressesToShow.map((w) => w.address());
								setSelectedAddresses(newSelection);
							}}
						/>
						<span className="font-semibold">{t("COMMON.SELECT_ALL")}</span>
					</label>

					{!isManageMode && (
						<Tooltip
							visible={showManageHint}
							interactive={true}
							/* istanbul ignore next -- @preserve */
							maxWidth={isXs ? 264 : "none"}
							content={
								<div className="px-[3px] pb-1.5 text-sm leading-5 sm:space-x-4 sm:pt-px sm:pb-px">
									<span className="mb-2 block sm:mb-0 sm:inline">
										{t("WALLETS.ADDRESSES_SIDE_PANEL.MANAGE_HINT")}
									</span>
									<Button
										size="xs"
										variant="transparent"
										data-testid="HideManageHint"
										className="bg-theme-primary-500 dim:bg-theme-dim-navy-600 w-full px-4 py-1.5 sm:w-auto"
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
								onClick={() => setManageMode(true)}
								className={cn(
									"text-theme-primary-600 dark:text-theme-primary-400 dim:text-theme-dim-navy-600 p-2 py-[3px] text-sm leading-[18px] sm:text-base sm:leading-5",
									{
										"ring-theme-primary-400 ring-offset-theme-secondary-100 dark:ring-theme-primary-800 dark:ring-offset-theme-dark-950 dim:ring-offset-theme-dim-navy-800 ring-3 ring-offset-4 sm:ring-offset-transparent dark:sm:ring-offset-transparent":
											showManageHint,
									},
								)}
							>
								<Icon name="Gear" size="lg" dimensions={[16, 16]} />
								<span>{t("COMMON.MANAGE")}</span>
							</Button>
						</Tooltip>
					)}

					{isManageMode && (
						<div className="flex items-center space-x-2 px-2 leading-[18px] sm:leading-5">
							<Button
								data-testid="BackManage"
								size="icon"
								variant="primary-transparent"
								onClick={disableManageState}
								className="text-theme-primary-600 dark:text-theme-primary-400 dim:text-theme-dim-navy-600 p-2 py-[3px] text-sm leading-[18px] sm:text-base sm:leading-5"
							>
								<Icon name="Back" dimensions={[16, 16]} />
								<span>{t("COMMON.BACK")}</span>
							</Button>
						</div>
					)}
				</div>
			</div>

			{isManageMode && (
				<div className="bg-theme-info-50 dark:bg-theme-dark-800 dim:bg-theme-dim-800 my-2 flex flex-col overflow-hidden rounded sm:my-3 sm:flex-row sm:items-center sm:rounded-xl">
					<div className="bg-theme-info-100 dark:bg-theme-info-600 dim:bg-theme-dim-navy-600 flex w-full items-center space-x-2 px-4 py-2 sm:w-auto sm:space-x-0 sm:py-4.5">
						<Icon
							name="CircleInfo"
							className="text-theme-info-700 dim:text-white dark:text-white"
							dimensions={[16, 16]}
						/>
						<span className="text-theme-info-700 dim:text-white text-sm leading-[17px] font-semibold sm:hidden dark:text-white">
							{t("COMMON.INFORMATION")}
						</span>
					</div>
					<div className="text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50 p-4 text-sm">
						{t("WALLETS.ADDRESSES_SIDE_PANEL.DELETE_INFO")}
					</div>
				</div>
			)}

			<div className="space-y-1">
				{addressesToShow.length === 0 ? (
					<EmptyBlock size="sm">{t("WALLETS.ADDRESSES_SIDE_PANEL.NO_SEARCH_RESULTS")}</EmptyBlock>
				) : (
					addressesToShow.map((wallet, index) => (
						<AddressRow
							profile={profile}
							errorMessage={
								selectedAddresses.length === 0 && !isManageMode && index === 0
									? "You need to have at least one address selected."
									: undefined
							}
							isError={
								(selectedAddresses.length === 0 && !isManageMode) ||
								wallet.address() === addressToDelete
							}
							key={wallet.address()}
							wallet={wallet}
							toggleAddress={() => {
								if (isManageMode) {
									return;
								}

								// Automatically close if single mode.
								const newSelection = toggleSelection(wallet);
								if (profile.walletSelectionMode() === "single") {
									closeSidepanel(newSelection);
								}
							}}
							isSelected={selectedAddresses.includes(wallet.address())}
							isSingleView={activeMode === AddressViewSelection.single}
							usesManageMode={isManageMode}
							onDelete={(address: string) => setAddressToDelete(address)}
							onEdit={(address?: string) => setAddressToEdit(address)}
							editContent={
								addressToEdit === wallet.address() ? (
									<UpdateAddressName
										onAfterSave={() => setAddressToEdit(undefined)}
										onCancel={() => disableManageState()}
										profile={profile}
										wallet={wallet}
									/>
								) : undefined
							}
							deleteContent={
								addressToDelete === wallet.address() ? (
									<DeleteAddressMessage
										onCancelDelete={disableManageState}
										onConfirmDelete={() => void handleDelete(wallet)}
									/>
								) : undefined
							}
						/>
					))
				)}
			</div>
		</SidePanel>
	);
};
