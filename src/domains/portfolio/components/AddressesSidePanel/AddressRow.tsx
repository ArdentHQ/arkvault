import { Contracts } from "@/app/lib/profiles";
import cn from "classnames";
import { Checkbox } from "@/app/components/Checkbox";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import React, { JSX } from "react";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { useBreakpoint, useWalletAlias } from "@/app/hooks";
import { MobileAddressRow } from "@/domains/portfolio/components/AddressesSidePanel/MobileAddressRow";
import { RadioButton } from "@/app/components/RadioButton";
import { Dropdown, DropdownOption } from "@/app/components/Dropdown";
import { useTranslation } from "react-i18next";
import { useLink } from "@/app/hooks/use-link";
import { TFunction } from "i18next";
import { Label } from "@/app/components/Label";

export const getMenuOptions = (t: TFunction): DropdownOption[] => [
	{
		icon: "Pencil",
		iconPosition: "start",
		label: t("COMMON.EDIT_item", { item: t("COMMON.NAME") }),
		value: "edit",
	},
	{
		icon: "ArrowExternal",
		iconPosition: "start",
		label: t("COMMON.OPEN_IN_EXPLORER"),
		value: "open-explorer",
	},
];

export const AddressRow = ({
	profile,
	wallet,
	toggleAddress,
	isSelected,
	usesManageMode,
	onDelete,
	onEdit,
	isError = false,
	isSingleView = false,
	errorMessage,
	deleteContent,
	editContent,
}: {
	profile: Contracts.IProfile;
	wallet: Contracts.IReadWriteWallet;
	toggleAddress: (address: string) => void;
	isSelected: boolean;
	isError?: boolean;
	usesManageMode: boolean;
	errorMessage?: string;
	onDelete: (address: string) => void;
	onEdit: (address?: string) => void;
	isSingleView?: boolean;
	deleteContent?: React.ReactNode;
	editContent?: React.ReactNode;
}): JSX.Element => {
	const { t } = useTranslation();
	const { isXs } = useBreakpoint();

	const { openExternal } = useLink();
	const { getWalletAlias } = useWalletAlias();

	const handleSelectOption = (action: DropdownOption, wallet: Contracts.IReadWriteWallet) => {
		if (action.value === "open-explorer") {
			openExternal(wallet.explorerLink());
			return;
		}

		onEdit(wallet.address());
	};

	if (isXs) {
		return (
			<MobileAddressRow
				profile={profile}
				wallet={wallet}
				toggleAddress={toggleAddress}
				isSelected={isSelected}
				usesManageMode={usesManageMode}
				onDelete={onDelete}
				isError={isError}
				errorMessage={errorMessage}
				deleteContent={deleteContent}
				editContent={editContent}
				isSingleView={isSingleView}
				onSelectOption={handleSelectOption}
			/>
		);
	}

	const { alias } = getWalletAlias({ address: wallet.address(), network: wallet.network(), profile });

	const isEditing = !!editContent;

	return (
		<div
			data-testid="AddressRow"
			onClick={() => {
				if (isSingleView && isSelected) {
					return;
				}

				toggleAddress(wallet.address());
			}}
			onKeyPress={() => toggleAddress(wallet.address())}
			tabIndex={0}
			className={cn("group cursor-pointer items-center rounded-lg border transition-all", {
				"bg-theme-secondary-200 dim:bg-theme-dim-950 dark:bg-theme-dark-950": isSelected && !usesManageMode,
				"border-theme-danger-400 dim:border-theme-danger-400 dark:border-theme-danger-400": isError,
				"border-theme-primary-200 dim:border-theme-dim-700 dark:border-theme-dark-700": !isError,
				"hover:bg-theme-navy-100 dim-hover:bg-theme-dim-700 dark:hover:bg-theme-dark-700":
					(!isError || (usesManageMode && !deleteContent)) && !isEditing,
			})}
		>
			<div className="flex items-center px-4 py-3 duration-150">
				{usesManageMode && !deleteContent && (
					<Button
						onClick={() => onDelete(wallet.address())}
						data-testid={`AddressRow--delete-${wallet.address()}`}
						disabled={isEditing}
						size="icon"
						className={cn(
							"p-1 text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-secondary-500",
							{
								"hover:bg-theme-danger-400 hover:text-white dim-hover:text-white dark:hover:text-white":
									!isEditing,
							},
						)}
						variant="transparent"
					>
						<Icon name="Trash" dimensions={[16, 16]} />
					</Button>
				)}

				{usesManageMode && deleteContent && (
					<Icon
						data-testid="icon-MarkedTrash"
						name="MarkedTrash"
						dimensions={[16, 16]}
						className="p-1 text-theme-secondary-500 dim:text-theme-dim-200 dark:text-theme-dark-500"
					/>
				)}

				{isSingleView && !usesManageMode && (
					<RadioButton
						name="single"
						data-testid="AddressRow--radio"
						color="info"
						className="m-0.5 h-5 w-5"
						checked={isSelected}
					/>
				)}

				{!usesManageMode && !isSingleView && (
					<Checkbox
						name="all"
						data-testid="AddressRow--checkbox"
						className="dim:not-checked:bg-transparent! m-0.5"
						checked={isSelected}
					/>
				)}

				<div className="ml-4 flex w-full min-w-0 items-center justify-between border-l border-theme-primary-200 pl-4 font-semibold text-theme-secondary-700 dim:border-theme-dim-700 dim:text-theme-dim-200 dark:border-theme-dark-700 dark:text-theme-dark-200">
					<div className="flex w-1/2 min-w-0 flex-col space-y-2 truncate">
						<div
							className={cn("flex gap-2 leading-5", {
								"group-hover:text-theme-primary-900 dim:group-hover:text-theme-dim-50 dark:group-hover:text-theme-dark-200":
									!isSelected,
								"text-theme-secondary-900 dim:text-theme-dim-50 dark:text-theme-dark-50":
									isSelected && !usesManageMode,
							})}
						>
							{alias}
							{wallet.isHDWallet() && (
								<Label
									color={isSelected ? "primary" : "neutral"}
									size="xs"
									variant="outline"
									className="truncate border py-0.5 uppercase"
									data-testid="hd-wallet-label"
								>
									{wallet.accountName()}
								</Label>
							)}
						</div>
						<Address
							address={wallet.address()}
							showCopyButton
							addressClass="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 text-sm leading-[17px]"
						/>
					</div>
					<div className="flex w-1/2 min-w-0 flex-col items-end space-y-2">
						<Amount
							ticker={wallet.network().ticker()}
							value={wallet.balance()}
							className={cn("leading-5", {
								"group-hover:text-theme-primary-900 dim:group-hover:text-theme-dim-50 dark:group-hover:text-theme-dark-200":
									!isSelected,
								"text-theme-secondary-900 dim:text-theme-dim-200 dark:text-theme-dark-50":
									isSelected && !usesManageMode,
							})}
						/>
						<Amount
							ticker={wallet.exchangeCurrency()}
							value={wallet.convertedBalance()}
							className="text-sm leading-[17px]"
						/>
					</div>
				</div>

				{usesManageMode && (
					<Dropdown
						disableToggle={isEditing || !!deleteContent}
						placement="bottom-end"
						wrapperClass="z-50"
						toggleContent={
							<Button
								size="icon"
								variant="transparent"
								className={cn("ml-4 p-1", {
									"hover:bg-theme-navy-200 dim-hover:bg-theme-dim-800 dark:hover:bg-theme-secondary-700":
										!isEditing && !deleteContent,
								})}
							>
								<Icon
									name="EllipsisVerticalFilled"
									size="md"
									className={cn("transition-colors duration-200", {
										"text-theme-secondary-500": isEditing || deleteContent,
										"text-theme-secondary-700 group-hover:text-theme-navy-700 dim:text-theme-dim-200 dim-hover:text-theme-dim-50 dark:text-theme-secondary-600 dark:group-hover:text-theme-secondary-200":
											!isEditing && !deleteContent,
									})}
								/>
							</Button>
						}
						options={getMenuOptions(t)}
						onSelect={(action) => handleSelectOption(action, wallet)}
					/>
				)}
			</div>
			{!!errorMessage && (
				<div className="flex items-center gap-3 space-x-4 rounded-b-lg bg-theme-danger-50 px-4 py-3 dim:bg-theme-dim-800 dark:bg-theme-dark-800">
					<div className="mx-[2px] flex w-5 items-center justify-center">
						<Icon
							name="CircleCross"
							className="text-theme-danger-700 dim:text-theme-danger-400 dark:text-theme-danger-400"
							size="md"
						/>
					</div>
					<p className="text-sm text-theme-secondary-900 dim:text-theme-dim-50 dark:text-theme-dark-50">
						{errorMessage}
					</p>
				</div>
			)}

			<div
				className={cn("transition-all duration-300", {
					"max-h-0 opacity-0": !isEditing,
					"max-h-52 opacity-100": isEditing,
				})}
			>
				{editContent}
			</div>

			<div
				className={cn("transition-all duration-300", {
					"max-h-0 opacity-0": !deleteContent,
					"max-h-52 opacity-100": deleteContent,
				})}
			>
				{deleteContent}
			</div>
		</div>
	);
};
