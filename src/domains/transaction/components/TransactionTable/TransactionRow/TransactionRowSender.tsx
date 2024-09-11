import cn from "classnames";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React, { useMemo } from "react";

import { TransactionRowMode } from "./TransactionRowMode";
import { Address } from "@/app/components/Address";
import { useBreakpoint, useWalletAlias } from "@/app/hooks";

interface Properties {
	transaction: DTO.ExtendedConfirmedTransactionData;
	profile: Contracts.IProfile;
	labelClass?: string;
	showTransactionMode?: boolean;
}

export const TransactionRowSender = ({
	transaction,
	profile,
	labelClass,
	showTransactionMode = true,
}: Properties) => {
	const { isXs, isSm } = useBreakpoint();
	const { getWalletAlias } = useWalletAlias();

	const { alias } = useMemo(
		() =>
			getWalletAlias({
				address: transaction.sender(),
				network: transaction.wallet().network(),
				profile,
			}),
		[profile, getWalletAlias, transaction],
	);

	return (
		<>
			{showTransactionMode && (
				<TransactionRowMode transaction={transaction} transactionType="transfer" />
			)}
			<div className={cn("w-0 flex-1", labelClass)}>
				<Address
					walletName={alias}
					address={transaction.sender()}
					alignment={isXs || isSm ? "right" : undefined}
				/>
			</div>
		</>
	);
};
