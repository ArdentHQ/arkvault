import React from "react";

import { VoteItemProperties } from "./VoteList.contracts";
import { VoteItemMobile } from "./VoteItemMobile";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import { useBreakpoint } from "@/app/hooks";

export const VoteItem = ({ wallet, amount = 0, currency, isNegativeAmount }: VoteItemProperties) => {
	const { isXs, isSm } = useBreakpoint();

	if (isSm || isXs) {
		return <VoteItemMobile currency={currency} wallet={wallet} amount={amount} />;
	}

	return (
		<div className="border-theme-secondary-300 dark:border-theme-secondary-800 flex items-center border-b border-dashed py-4 last:border-b-0">
			<div className="w-28 flex-1">
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
