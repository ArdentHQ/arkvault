import React from "react";

import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import { Avatar } from "@/app/components/Avatar";
import { useBreakpoint } from "@/app/hooks";

import { VoteItemMobile } from "./VoteItemMobile";
import { VoteItemProperties } from "./VoteList.contracts";

export const VoteItem = ({ wallet, amount = 0, currency, isNegativeAmount }: VoteItemProperties) => {
	const { isXs, isSm } = useBreakpoint();

	if (isSm || isXs) {
		return <VoteItemMobile currency={currency} wallet={wallet} amount={amount} />;
	}

	return (
		<div className="flex items-center border-b border-dashed border-theme-secondary-300 py-4 last:border-b-0 dark:border-theme-secondary-800">
			<Avatar size="sm" address={wallet.address()} />

			<div className="ml-4 w-28 flex-1">
				<Address address={wallet.address()} walletName={wallet.username()} />
			</div>

			{amount > 0 && (
				<div className="grow pl-3 text-right">
					<Amount ticker={currency} value={amount} isNegative={isNegativeAmount} showSign />
				</div>
			)}
		</div>
	);
};
