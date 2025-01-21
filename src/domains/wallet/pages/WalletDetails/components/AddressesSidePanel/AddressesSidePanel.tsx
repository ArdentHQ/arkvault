import { SidePanel } from "@/app/components/SidePanel/SidePanel";
import { Input } from "@/app/components/Input";
import { Icon } from "@/app/components/Icon";
import { Checkbox } from "@/app/components/Checkbox";
import { t } from "i18next";
import { Button } from "@/app/components/Button";
import React, { ChangeEvent, useEffect, useState } from "react";
import { IWalletRepository } from "@ardenthq/sdk-profiles/distribution/esm/wallet.repository.contract";
import { AddressRow } from "@/domains/wallet/pages/WalletDetails/components/AddressesSidePanel/AddressRow";
import { Divider } from "@/app/components/Divider";
import cn from "classnames";
import { Tooltip } from "@/app/components/Tooltip";

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

	useEffect(() => {
		if (!open) {
			setShowManageHint(false);
			return;
		}

		const id = setTimeout(() => {
			setShowManageHint(getMessageValue("manage-button", true));
		}, 1000);

		return () => {
			clearTimeout(id);
		};
	}, [open]);

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
			header="Choose Address"
			open={open}
			onOpenChange={(open) => {
				resetDeleteState();
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
					className={cn("flex cursor-pointer items-center space-x-3 leading-5", {
						"text-theme-secondary-500": isDeleteMode,
						"text-theme-secondary-700 hover:text-theme-primary-600": !isDeleteMode,
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
					<span className="font-semibold">{t("COMMON.SELECT_ALL")}</span>
				</label>

				{!isDeleteMode && (
					<Tooltip
						visible={showManageHint}
						interactive={true}
						onHide={() => {
							setMessageValue("manage-button", false);
						}}
						content={
							<div className="space-x-4 px-[3px] py-px text-sm leading-5">
								<span> You can manage and remove your addresses here.</span>
								<Button
									size="xs"
									variant="transparent"
									className="bg-theme-primary-500 px-4 py-1.5"
									onClick={() => {
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
							data-testid="NavigationBar__buttons__mobile--home"
							size="icon"
							variant="transparent"
							onClick={() => setDeleteMode(true)}
							className={cn("p-0 text-theme-primary-600 dark:text-theme-secondary-600", {
								"ring ring-theme-primary-400 ring-offset-4": showManageHint,
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
							data-testid="NavigationBar__buttons__mobile--home"
							size="icon"
							variant="transparent"
							onClick={resetDeleteState}
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
								for (const address of addressesToDelete) {
									onDeleteAddress(address);
								}

								const activeAddresses = selectedAddresses.filter(
									(address) => !addressesToDelete.includes(address),
								);

								onSelectedAddressesChange(activeAddresses);

								resetDeleteState();
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

const MessagesStorageKey = "onboarding-messages";

function getMessageValue(key: string, defaultValue: boolean): boolean {
	const storedValue = localStorage.getItem(MessagesStorageKey);

	if (!storedValue) {
		return defaultValue;
	}

	const decodedValue = JSON.parse(storedValue) as Record<string, boolean>;

	if (decodedValue[key] !== undefined) {
		return decodedValue[key];
	}

	return defaultValue;
}

function setMessageValue(key: string, value: boolean): void {
	const storedValue = localStorage.getItem(MessagesStorageKey);

	let decodedValue: Record<string, boolean> = {};

	if (storedValue) {
		decodedValue = JSON.parse(storedValue) as Record<string, boolean>;
	}

	decodedValue[key] = value;

	localStorage.setItem(MessagesStorageKey, JSON.stringify(decodedValue));
}
