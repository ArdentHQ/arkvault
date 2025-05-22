import { Contracts } from "@/app/lib/profiles";
import cn from "classnames";
import { Checkbox } from "@/app/components/Checkbox";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import React from "react";
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
								className="p-1 hover:text-white text-theme-secondary-700 dark:text-theme-secondary-500 dark:hover:text-white hover:bg-theme-danger-400"
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
								className="p-1 text-theme-secondary-500 dark:text-theme-dark-500"
							/>
						)}
					</div>
				}
			>
				<div className={cn("sm:w-full sm:p-0")}>
					<div className="px-4 pt-3 pb-4 space-y-4 sm:hidden">
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
									className="text-sm font-semibold text-theme-secondary-900 leading-[17px] dark:text-theme-secondary-200"
								/>
							}
						/>
					</div>
					{!!errorMessage && (
						<div className="flex py-3 px-4 space-x-4 rounded-b-sm bg-theme-danger-50 dark:bg-theme-dark-800">
							<div className="flex justify-center mt-1 w-5 mx-[2px]">
								<Icon
									name="CircleCross"
									className="text-theme-danger-700 dark:text-theme-danger-400"
									size="md"
								/>
							</div>
							<p className="text-sm text-theme-secondary-700 max-w-60 dark:text-theme-dark-50">
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
