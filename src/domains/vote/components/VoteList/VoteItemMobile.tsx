import React from "react";
import { VoteItemProperties } from "./VoteList.contracts";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import { Avatar } from "@/app/components/Avatar";

export const VoteItemMobile = ({
	wallet,
	amount,
	currency,
	isNegativeAmount,
}: VoteItemProperties & { amount: number }) => (
	<div
		className="relative flex items-center justify-end space-x-4 border-b border-dashed border-theme-secondary-300 py-4 pt-0 pb-0 last:border-b-0 dark:border-theme-secondary-800 md:pt-4 md:pb-4"
	>
		{amount > 0 && (
			<div className="w-0 flex-1 pl-3 pr-4 text-right sm:px-0">
				<Amount ticker={currency} value={10} isNegative={isNegativeAmount} showSign />
			</div>
		)}

		<div className="w-0 flex-1 text-right md:text-left">
			<Address
				address={wallet.address()}
				alignment="right"
				walletName={wallet.username()}
				walletNameClass="text-theme-text"
			/>
		</div>

		<Avatar size="xs" address={wallet.address()} />
	</div>
);
