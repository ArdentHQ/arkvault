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
	<div className="flex relative justify-end items-center py-4 pt-0 pb-0 space-x-4 border-b border-dashed md:pt-4 md:pb-4 last:border-b-0 border-theme-secondary-300 dark:border-theme-secondary-800">
		{amount > 0 && (
			<div className="flex-1 pr-4 pl-3 w-0 text-right sm:px-0">
				<Amount ticker={currency} value={10} isNegative={isNegativeAmount} showSign />
			</div>
		)}

		<div className="flex-1 w-0 text-right md:text-left">
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
