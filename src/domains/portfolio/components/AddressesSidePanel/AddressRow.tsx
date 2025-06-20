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

export const AddressRow = ({
	profile,
	wallet,
	toggleAddress,
	isSelected,
	usesDeleteMode,
	onDelete,
	isError = false,
	isSingleView = false,
	errorMessage,
	deleteContent,
}: {
	profile: Contracts.IProfile;
	wallet: Contracts.IReadWriteWallet;
	toggleAddress: (address: string) => void;
	isSelected: boolean;
	isError?: boolean;
	usesDeleteMode: boolean;
	errorMessage?: string;
	onDelete: (address: string) => void;
	isSingleView?: boolean;
	deleteContent?: React.ReactNode;
}): JSX.Element => {
	const { isXs } = useBreakpoint();

	const { getWalletAlias } = useWalletAlias();

	if (isXs) {
		return (
			<MobileAddressRow
				profile={profile}
				wallet={wallet}
				toggleAddress={toggleAddress}
				isSelected={isSelected}
				usesDeleteMode={usesDeleteMode}
				onDelete={onDelete}
				isError={isError}
				errorMessage={errorMessage}
				deleteContent={deleteContent}
			/>
		);
	}

	const { alias } = getWalletAlias({ address: wallet.address(), network: wallet.network(), profile });

	return (
		<div
			data-testid="AddressRow"
			onClick={() => toggleAddress(wallet.address())}
			onKeyPress={() => toggleAddress(wallet.address())}
			tabIndex={0}
			className={cn("group cursor-pointer items-center rounded-lg border transition-all", {
				"bg-theme-secondary-200 dark:bg-theme-dark-950": isSelected && !usesDeleteMode,
				"border-theme-danger-400 dark:border-theme-danger-400": isError,
				"border-theme-primary-200 dark:border-theme-dark-700": !isError,
				"hover:bg-theme-navy-100 dark:hover:bg-theme-dark-700":
					(!isSelected && !isError) || (usesDeleteMode && !deleteContent),
			})}
		>
			<div className="flex items-center px-4 py-3 duration-150">
				{usesDeleteMode && !deleteContent && (
					<Button
						onClick={() => onDelete(wallet.address())}
						data-testid={`AddressRow--delete-${wallet.address()}`}
						size="icon"
						className="text-theme-secondary-700 dark:text-theme-secondary-500 hover:bg-theme-danger-400 p-1 hover:text-white dark:hover:text-white"
						variant="transparent"
					>
						<Icon name="Trash" dimensions={[16, 16]} />
					</Button>
				)}

				{usesDeleteMode && deleteContent && (
					<Icon
						data-testid="icon-MarkedTrash"
						name="MarkedTrash"
						dimensions={[16, 16]}
						className="text-theme-secondary-500 dark:text-theme-dark-500 p-1"
					/>
				)}

				{isSingleView && !usesDeleteMode && (
					<RadioButton
						name="single"
						data-testid="AddressRow--radio"
						color="info"
						className="m-0.5 h-5 w-5"
						checked={isSelected}
						onChange={() => toggleAddress(wallet.address())}
					/>
				)}

				{!usesDeleteMode && !isSingleView && (
					<Checkbox
						name="all"
						data-testid="AddressRow--checkbox"
						className="m-0.5"
						checked={isSelected}
						onChange={() => toggleAddress(wallet.address())}
					/>
				)}

				<div className="border-theme-primary-200 text-theme-secondary-700 dark:border-theme-dark-700 dark:text-theme-dark-200 ml-4 flex w-full min-w-0 items-center justify-between border-l pl-4 font-semibold">
					<div className="flex w-1/2 min-w-0 flex-col space-y-2 truncate">
						<div
							className={cn("leading-5", {
								"group-hover:text-theme-primary-900 dark:group-hover:text-theme-dark-200": !isSelected,
								"text-theme-secondary-900 dark:text-theme-dark-50": isSelected && !usesDeleteMode,
							})}
						>
							{alias}
						</div>
						<Address
							address={wallet.address()}
							showCopyButton
							addressClass="text-theme-secondary-700 dark:text-theme-dark-200 text-sm leading-[17px]"
						/>
					</div>
					<div className="flex w-1/2 min-w-0 flex-col items-end space-y-2">
						<Amount
							ticker={wallet.network().ticker()}
							value={+wallet.balance().toFixed(2)}
							className={cn("leading-5", {
								"group-hover:text-theme-primary-900 dark:group-hover:text-theme-dark-200": !isSelected,
								"text-theme-secondary-900 dark:text-theme-dark-50": isSelected && !usesDeleteMode,
							})}
						/>
						<Amount
							ticker={wallet.exchangeCurrency()}
							value={wallet.convertedBalance()}
							className="text-sm leading-[17px]"
						/>
					</div>
				</div>
			</div>
			{!!errorMessage && (
				<div className="bg-theme-danger-50 dark:bg-theme-dark-800 flex items-center space-x-4 rounded-b-lg px-4 py-3">
					<div className="mx-[2px] flex w-5 items-center justify-center">
						<Icon
							name="CircleCross"
							className="text-theme-danger-700 dark:text-theme-danger-400"
							size="md"
						/>
					</div>
					<p className="text-theme-secondary-700 dark:text-theme-dark-50 text-sm">{errorMessage}</p>
				</div>
			)}
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
