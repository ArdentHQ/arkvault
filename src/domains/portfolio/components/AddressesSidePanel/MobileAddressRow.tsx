import { Contracts } from "@ardenthq/sdk-profiles";
import cn from "classnames";
import { Checkbox } from "@/app/components/Checkbox";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import React from "react";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { InfoDetail, MultiEntryItem } from "@/app/components/MultiEntryItem/MultiEntryItem";

export const MobileAddressRow = ({
	wallet,
	toggleAddress,
	isSelected,
	usesDeleteMode,
	onDelete,
	isError,
	errorMessage,
}: {
	wallet: Contracts.IReadWriteWallet;
	toggleAddress: (address: string) => void;
	isSelected: boolean;
	usesDeleteMode: boolean;
	onDelete: (address: string) => void;
	isError?: boolean;
	errorMessage?: string;
}): JSX.Element => (
	<div className="space-y-2">
		<MultiEntryItem
			className={cn({ "border-theme-danger-400 dark:border-theme-danger-400": isError })}
			dataTestId="MobileAddressRow"
			titleSlot={
				<div
					data-testid="MobileAddressRowHeader"
					onClick={() => toggleAddress(wallet.address())}
					tabIndex={0}
					className="flex items-center space-x-3"
				>
					{usesDeleteMode && (
						<Button
							onClick={() => onDelete(wallet.address())}
							data-testid={`AddressRow--delete-${wallet.address()}`}
							size="icon"
							className="p-0 text-theme-secondary-700 hover:bg-theme-danger-400 hover:text-white dark:text-theme-secondary-500 hover:dark:text-white"
							variant="transparent"
						>
							<Icon name="Trash" dimensions={[16, 16]} />
						</Button>
					)}

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
						className={cn("text-sm font-semibold leading-[17px]", {
							"group-hover:text-theme-primary-900 group-hover:dark:text-theme-dark-200": !isSelected,
							"text-theme-secondary-900 dark:text-theme-dark-50": isSelected && !usesDeleteMode,
						})}
					>
						{wallet.displayName()}
					</div>
				</div>
			}
		>
			<div className={cn("sm:w-full sm:p-0")}>
				<div className="space-y-4 px-4 pb-4 pt-3 sm:hidden">
					<InfoDetail
						label="Address"
						body={
							<Address
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
								className="text-sm font-semibold leading-[17px] text-theme-secondary-900 dark:text-theme-secondary-200"
							/>
						}
					/>
				</div>
				{!!errorMessage && (
					<div className="flex space-x-4 rounded-b-sm bg-theme-danger-50 px-4 py-3 dark:bg-theme-dark-800">
						<div className="mx-[2px] mt-1 flex w-5 justify-center">
							<Icon
								name="CircleCross"
								className="text-theme-danger-700 dark:text-theme-danger-400"
								size="md"
							/>
						</div>
						<p className="max-w-60 text-sm text-theme-secondary-700 dark:text-theme-dark-50">
							{errorMessage}
						</p>
					</div>
				)}
			</div>
		</MultiEntryItem>
	</div>
);
