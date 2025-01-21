import { SidePanel } from "@/app/components/SidePanel/SidePanel";
import { Input } from "@/app/components/Input";
import { Icon } from "@/app/components/Icon";
import { Checkbox } from "@/app/components/Checkbox";
import { t } from "i18next";
import { Button } from "@/app/components/Button";
import React, { ChangeEvent, useState } from "react";
import { IWalletRepository } from "@ardenthq/sdk-profiles/distribution/esm/wallet.repository.contract";
import { AddressRow } from "@/domains/wallet/pages/WalletDetails/components/AddressesSidePanel/AddressRow";
import { Divider } from "@/app/components/Divider";
import cn from "classnames";

export const AddressesSidePanel = ({
	wallets,
	selectedAddresses,
	onSelectedAddressesChange,
	open,
	onOpenChange,
	deleteAddress,
}: {
	wallets: IWalletRepository;
	selectedAddresses: string[];
	onSelectedAddressesChange: (addresses: string[]) => void;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	deleteAddress: (address: string) => void;
}): JSX.Element => {
	const [searchQuery, setSearchQuery] = useState<string>("");

	const [isDeleteMode, setDeleteMode] = useState<boolean>(false);

	const [addressesToDelete, setAddressesToDelete] = useState<string[]>([]);

	const toggleAddress = (address: string) => {
		selectedAddresses.includes(address)
			? onSelectedAddressesChange(selectedAddresses.filter((a) => a !== address))
			: onSelectedAddressesChange([...selectedAddresses, address]);
	};

	const markForDelete = (address: string) => {
		setAddressesToDelete([...addressesToDelete, address]);
	};

	const resetMarkedAddresses = () => {
		setAddressesToDelete([]);
		setDeleteMode(false);
	};

	const deleteMarkedAddresses = () => {
		for (const address of addressesToDelete) {
			deleteAddress(address);
		}
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
			header="Choose Address"
			open={open}
			onOpenChange={(open) => {
				resetMarkedAddresses();
				onOpenChange(open);
			}}
			dataTestId="AddressesSidePanel"
		>
			<Input
				placeholder="Search by Name or Address"
				innerClassName="font-normal"
				value={searchQuery}
				isFocused
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
					className={cn("flex cursor-pointer items-center space-x-3 rounded-md leading-5", {
						disabled: isDeleteMode,
					})}
				>
					<Checkbox
						name="all"
						disabled={isDeleteMode}
						checked={!isDeleteMode && selectedAddresses.length === addressesToShow.length}
						onChange={() => {
							selectedAddresses.length === addressesToShow.length
								? onSelectedAddressesChange([])
								: onSelectedAddressesChange(addressesToShow.map((w) => w.address()));
						}}
					/>
					<span className="font-semibold text-theme-secondary-700">{t("COMMON.SELECT_ALL")}</span>
				</label>

				{!isDeleteMode && (
					<Button
						data-testid="NavigationBar__buttons__mobile--home"
						size="icon"
						variant="transparent"
						onClick={() => setDeleteMode(true)}
						className="p-0 text-theme-primary-600 dark:text-theme-secondary-600"
					>
						<Icon name="Gear" size="lg" dimensions={[16, 16]} />
						<span>{t("COMMON.MANAGE")}</span>
					</Button>
				)}

				{isDeleteMode && (
					<div className="leading-5">
						<Button
							data-testid="NavigationBar__buttons__mobile--home"
							size="icon"
							variant="transparent"
							onClick={resetMarkedAddresses}
							className="p-0 text-theme-primary-600 dark:text-theme-secondary-600"
						>
							{t("COMMON.CANCEL")}
						</Button>

						<Divider type="vertical" className="border-theme-primary-300" />

						<Button
							data-testid="NavigationBar__buttons__mobile--home"
							size="icon"
							variant="transparent"
							onClick={() => {
								deleteMarkedAddresses();

								const activeAddresses = selectedAddresses.filter(
									(address) => !addressesToDelete.includes(address),
								);

								onSelectedAddressesChange(activeAddresses);

								resetMarkedAddresses();
							}}
							className="p-0 text-theme-primary-600 dark:text-theme-secondary-600"
						>
							{t("COMMON.DONE")}
						</Button>
					</div>
				)}
			</div>

			<div className="space-y-1">
				{addressesToShow.map((wallet) => (
					<AddressRow
						key={wallet.address()}
						wallet={wallet}
						toggleAddress={toggleAddress}
						isSelected={selectedAddresses.includes(wallet.address())}
						usesDeleteMode={isDeleteMode}
						onDelete={markForDelete}
					/>
				))}
			</div>
		</SidePanel>
	);
};
