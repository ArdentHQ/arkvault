import { Contracts } from "@/app/lib/profiles";
import cn from "classnames";
import { Checkbox } from "@/app/components/Checkbox";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import React, { JSX } from "react";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { InfoDetail, MultiEntryItem } from "@/app/components/MultiEntryItem/MultiEntryItem";
import { useWalletAlias } from "@/app/hooks";

export const MobileAddressRow = ({
	profile,
	wallet,
	toggleAddress,
	isSelected,
	usesDeleteMode,
	onDelete,
	isError,
	errorMessage,
	deleteContent,
}: {
	profile: Contracts.IProfile;
	wallet: Contracts.IReadWriteWallet;
	toggleAddress: (address: string) => void;
	isSelected: boolean;
	usesDeleteMode: boolean;
	onDelete: (address: string) => void;
	isError?: boolean;
	errorMessage?: string;
	deleteContent?: React.ReactNode;
}): JSX.Element => {
	const { getWalletAlias } = useWalletAlias();
	const { alias } = getWalletAlias({ address: wallet.address(), network: wallet.network(), profile });

	return (
		<div className="space-y-2">
			<MultiEntryItem
				className={cn({ "border-theme-danger-400 dark:border-theme-danger-400": isError })}
				dataTestId="MobileAddressRow"
				titleSlot={
					<div
						data-testid="MobileAddressRowHeader"
						onClick={() => toggleAddress(wallet.address())}
						tabIndex={0}
						className={cn("flex w-full items-center space-x-3", { "justify-between": usesDeleteMode })}
					>
						{!usesDeleteMode && (
							<Checkbox
								name="all"
								data-testid="AddressRow--checkbox"
								className="m-0.5"
								checked={isSelected}
								onChange={() => toggleAddress(wallet.address())}
							/>
						)}

						<div
							className={cn("truncate text-sm leading-[17px] font-semibold", {
								"group-hover:text-theme-primary-900 dark:group-hover:text-theme-dark-200": !isSelected,
								"text-theme-secondary-900 dark:text-theme-dark-50": isSelected && !usesDeleteMode,
							})}
						>
							{alias}
						</div>

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
					</div>
				}
			>
				<div className={cn("sm:w-full sm:p-0")}>
					<div className="space-y-4 px-4 pt-3 pb-4 sm:hidden">
						<InfoDetail
							label="Address"
							body={
								<Address
									truncateOnTable
									address={wallet.address()}
									addressClass="leading-[17px] text-sm text-theme-secondary-900 dark:text-theme-dark-50"
								/>
							}
						/>
						<InfoDetail
							label="Value"
							body={
								<Amount
									ticker={wallet.network().ticker()}
									value={wallet.balance()}
									className="text-theme-secondary-900 dark:text-theme-secondary-200 text-sm leading-[17px] font-semibold"
								/>
							}
						/>
					</div>
					{!!errorMessage && (
						<div className="bg-theme-danger-50 dark:bg-theme-dark-800 flex space-x-4 rounded-b-sm px-4 py-3">
							<div className="mx-[2px] mt-1 flex w-5 justify-center">
								<Icon
									name="CircleCross"
									className="text-theme-danger-700 dark:text-theme-danger-400"
									size="md"
								/>
							</div>
							<p className="text-theme-secondary-700 dark:text-theme-dark-50 max-w-60 text-sm">
								{errorMessage}
							</p>
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
			</MultiEntryItem>
		</div>
	);
};
