import React from "react";

import { VoteItemProperties } from "./VoteList.contracts";
import { VoteItemMobile } from "./VoteItemMobile";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import { Avatar } from "@/app/components/Avatar";
import { useBreakpoint } from "@/app/hooks";

export const VoteItem = ({ wallet, amount = 0, currency, isNegativeAmount }: VoteItemProperties) => {
	const { isXs, isSm } = useBreakpoint();

	if (isSm || isXs) {
		return <VoteItemMobile currency={currency} wallet={wallet} amount={amount} />;
	}

	return (
		<div className="flex items-center py-4 border-b border-dashed last:border-b-0 border-theme-secondary-300 dark:border-theme-secondary-800">
			<Avatar size="sm" address={wallet.address()} />

			<div className="flex-1 ml-4 w-28">
				<Address address={wallet.address()} walletName={wallet.username()} />
			</div>

			{amount > 0 && (
				<div className="pl-3 text-right grow">
					<Amount ticker={currency} value={amount} isNegative={isNegativeAmount} showSign />
				</div>
			)}
		</div>
	);
};
