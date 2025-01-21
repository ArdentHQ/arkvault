import { IReadWriteWallet } from "@ardenthq/sdk-profiles/distribution/esm/wallet.contract";
import cn from "classnames";
import { Checkbox } from "@/app/components/Checkbox";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import React from "react";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";

export const AddressRow = ({
	wallet,
	toggleAddress,
	isSelected,
	usesDeleteMode,
	onDelete,
}: {
	wallet: IReadWriteWallet;
	toggleAddress: (address: string) => void;
	isSelected: boolean;
	usesDeleteMode: boolean;
	onDelete: (address: string) => void;
}): JSX.Element => {
	return (
		<div
			onClick={() => toggleAddress(wallet.address())}
			onKeyPress={() => toggleAddress(wallet.address())}
			tabIndex={0}
			className={cn(
				"group flex cursor-pointer items-center rounded-lg border border-theme-primary-200 px-4 py-3 transition-all",
				{
					"bg-theme-secondary-200": isSelected && !usesDeleteMode,
					"hover:bg-theme-navy-100": !isSelected,
				},
			)}
		>
			{usesDeleteMode && (
				<Button
					onClick={() => onDelete(wallet.address())}
					data-testid="AddressRow--delete"
					size="icon"
					className="p-1 text-theme-secondary-700 hover:bg-theme-danger-400 hover:text-white dark:text-theme-secondary-500"
					variant="transparent"
				>
					<Icon name="Trash" dimensions={[16, 16]} />
				</Button>
			)}

			{!usesDeleteMode && (
				<Checkbox
					name="all"
					className="m-0.5"
					checked={isSelected}
					onChange={() => toggleAddress(wallet.address())}
				/>
			)}

			<div className="ml-4 flex w-full min-w-0 items-center justify-between border-l border-theme-primary-200 pl-4 font-semibold text-theme-secondary-700">
				<div className="flex w-1/2 min-w-0 flex-col space-y-2">
					<div
						className={cn("leading-5", {
							"group-hover:text-theme-primary-900": !isSelected,
							"text-theme-secondary-900": isSelected && !usesDeleteMode,
						})}
					>
						{wallet.displayName()}
					</div>
					<Address
						address={wallet.address()}
						showCopyButton
						addressClass="text-theme-secondary-700 text-sm leading-[17px]"
					/>
				</div>
				<div className="flex w-1/2 min-w-0 flex-col items-end space-y-2">
					<Amount
						ticker={wallet.network().ticker()}
						value={+wallet.balance().toFixed(2)}
						className={cn("leading-5", {
							"group-hover:text-theme-primary-900": !isSelected,
							"text-theme-secondary-900": isSelected && !usesDeleteMode,
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
	);
};
