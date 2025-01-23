import { SidePanel } from "@/app/components/SidePanel/SidePanel";
import { Input } from "@/app/components/Input";
import { Icon } from "@/app/components/Icon";
import { Checkbox } from "@/app/components/Checkbox";
import { t } from "i18next";
import { Button } from "@/app/components/Button";
import React, { ChangeEvent, useEffect, useState } from "react";
import { IWalletRepository } from "@ardenthq/sdk-profiles/distribution/esm/wallet.repository.contract";
import { Divider } from "@/app/components/Divider";
import cn from "classnames";
import { Tooltip } from "@/app/components/Tooltip";
import { AddressRow } from "@/domains/wallet/pages/WalletDetails/components/AddressesSidePanel/AddressRow";
import { useLocalStorage } from "usehooks-ts";

export const AddressesSidePanel = ({
	wallets,
	selectedAddresses,
	onSelectedAddressesChange,
	open,
	onOpenChange,
	onDeleteAddress,
}: {
	wallets: IWalletRepository;
	selectedAddresses: string[];
	onSelectedAddressesChange: (addresses: string[]) => void;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDeleteAddress: (address: string) => void;
}): JSX.Element => {
	const [searchQuery, setSearchQuery] = useState<string>("");

	const [isDeleteMode, setDeleteMode] = useState<boolean>(false);

	const [addressesToDelete, setAddressesToDelete] = useState<string[]>([]);

	const [showManageHint, setShowManageHint] = useState<boolean>(false);
	const [manageHintHasShown, persistManageHint] = useLocalStorage("manage-hint", false);

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

	const toggleAddressSelection = (address: string) => {
		if (isDeleteMode) {
			return;
		}

		selectedAddresses.includes(address)
			? onSelectedAddressesChange(selectedAddresses.filter((a) => a !== address))
			: onSelectedAddressesChange([...selectedAddresses, address]);
	};

	const markForDelete = (address: string) => {
		setAddressesToDelete([...addressesToDelete, address]);
	};

	const resetDeleteState = () => {
		setAddressesToDelete([]);
		setDeleteMode(false);
	};

	const addressesToShow = wallets
		.values()
		.filter((wallet) => !addressesToDelete.includes(wallet.address()))
		.filter((wallet) => {
			if (!searchQuery) {
				return true;
			}

			const query = searchQuery.toLowerCase();

			return (
				wallet.address().toLowerCase().startsWith(query) || wallet.displayName()?.toLowerCase().includes(query)
			);
		});

	return (
		<SidePanel
			header={t("WALLETS.ADDRESSES_SIDE_PANEL.TITLE")}
			open={open}
			onOpenChange={(open) => {
				resetDeleteState();
				onOpenChange(open);
			}}
			dataTestId="AddressesSidePanel"
		>
			<Input
				placeholder={t("WALLETS.ADDRESSES_SIDE_PANEL.SEARCH_BY")}
				innerClassName="font-normal"
				value={searchQuery}
				isFocused
				data-testid="AddressesPanel--SearchInput"
				ignoreContext
				onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchQuery(event.target.value)}
				noShadow
				addons={{
					start: { content: <Icon name="MagnifyingGlassAlt" className="text-theme-secondary-500" /> },
				}}
			/>

			<div className="my-3 flex justify-between px-4">
				<label
					data-testid="SelectAllAddresses"
					className={cn("flex cursor-pointer items-center space-x-3 leading-5", {
						"text-theme-secondary-500 dark:text-theme-dark-500": isDeleteMode,
						"text-theme-secondary-700 hover:text-theme-primary-600 dark:text-theme-dark-200 hover:dark:text-theme-primary-500":
							!isDeleteMode,
					})}
				>
					<Checkbox
						name="all"
						disabled={isDeleteMode}
						data-testid="SelectAllAddresses_Checkbox"
						checked={!isDeleteMode && selectedAddresses.length === addressesToShow.length}
						onChange={() => {
							selectedAddresses.length === addressesToShow.length
								? onSelectedAddressesChange([])
								: onSelectedAddressesChange(addressesToShow.map((w) => w.address()));
						}}
					/>
					<span className="font-semibold">{t("COMMON.SELECT_ALL")}</span>
				</label>

				{!isDeleteMode && (
					<Tooltip
						visible={showManageHint}
						interactive={true}
						content={
							<div className="space-x-4 px-[3px] py-px text-sm leading-5">
								<span>{t("WALLETS.ADDRESSES_SIDE_PANEL.MANAGE_HINT")}</span>
								<Button
									size="xs"
									variant="transparent"
									data-testid="HideManageHint"
									className="bg-theme-primary-500 px-4 py-1.5"
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
							variant="transparent"
							onClick={() => setDeleteMode(true)}
							className={cn("p-0 text-theme-primary-600 dark:text-theme-primary-500", {
								"ring ring-theme-primary-400 ring-offset-4 ring-offset-theme-background dark:ring-theme-primary-800":
									showManageHint,
							})}
						>
							<Icon name="Gear" size="lg" dimensions={[16, 16]} />
							<span>{t("COMMON.MANAGE")}</span>
						</Button>
					</Tooltip>
				)}

				{isDeleteMode && (
					<div className="leading-5">
						<Button
							data-testid="CancelDelete"
							size="icon"
							variant="transparent"
							onClick={resetDeleteState}
							className="p-0 text-theme-primary-600 dark:text-theme-primary-500"
						>
							{t("COMMON.CANCEL")}
						</Button>

						<Divider type="vertical" className="border-theme-primary-300 dark:border-theme-dark-700" />

						<Button
							data-testid="ConfirmDelete"
							size="icon"
							variant="transparent"
							onClick={() => {
								for (const address of addressesToDelete) {
									onDeleteAddress(address);
								}

								const activeAddresses = selectedAddresses.filter(
									(address) => !addressesToDelete.includes(address),
								);

								onSelectedAddressesChange(activeAddresses);

								resetDeleteState();
							}}
							className="p-0 text-theme-primary-600 dark:text-theme-primary-500"
						>
							{t("COMMON.DONE")}
						</Button>
					</div>
				)}
			</div>

			{isDeleteMode && (
				<div className="my-3 flex items-center overflow-hidden rounded-xl bg-theme-info-50 dark:bg-theme-dark-800">
					<div className="bg-theme-info-100 px-4 py-4.5 dark:bg-theme-info-600">
						<Icon name="CircleInfo" className="text-theme-info-700 dark:text-white" dimensions={[16, 16]} />
					</div>
					<div className="p-4 text-sm text-theme-secondary-900 dark:text-theme-dark-50">
						{t("WALLETS.ADDRESSES_SIDE_PANEL.DELETE_INFO")}
					</div>
				</div>
			)}

			<div className="space-y-1">
				{addressesToShow.map((wallet) => (
					<AddressRow
						key={wallet.address()}
						wallet={wallet}
						toggleAddress={toggleAddressSelection}
						isSelected={selectedAddresses.includes(wallet.address())}
						usesDeleteMode={isDeleteMode}
						onDelete={markForDelete}
					/>
				))}
			</div>
		</SidePanel>
	);
};
