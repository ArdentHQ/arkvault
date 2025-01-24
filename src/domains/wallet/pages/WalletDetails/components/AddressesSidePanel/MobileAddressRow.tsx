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
}: {
	wallet: Contracts.IReadWriteWallet;
	toggleAddress: (address: string) => void;
	isSelected: boolean;
	usesDeleteMode: boolean;
	onDelete: (address: string) => void;
}): JSX.Element => (
	<div className="space-y-2">
		<MultiEntryItem
			titleSlot={
				<div
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
			bodySlot={
				<div>
					<div className="space-y-4 sm:hidden">
						<InfoDetail
							label="Address"
							body={
								<Address
									address={wallet.address()}
									addressClass="leading-[17px] text-sm text-theme-secondary-900 dark:text-theme-secondary-700"
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
				</div>
			}
		/>
	</div>
);
