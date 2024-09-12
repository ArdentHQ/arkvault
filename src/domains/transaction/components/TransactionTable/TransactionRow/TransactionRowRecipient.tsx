import cn from "classnames";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React, { useMemo } from "react";

import { TransactionRowRecipientIcon } from "./TransactionRowRecipientIcon";
import { TransactionRowRecipientLabel } from "./TransactionRowRecipientLabel";
import { useWalletAlias } from "@/app/hooks/use-wallet-alias";

interface Properties {
	transaction: DTO.ExtendedConfirmedTransactionData;
	profile: Contracts.IProfile;
	labelClass?: string;
}

export const TransactionRowRecipient = ({ transaction, profile, labelClass }: Properties) => {
	const { getWalletAlias } = useWalletAlias();

	const { alias } = useMemo(
		() =>
			getWalletAlias({
				address: transaction.recipient(),
				network: transaction.wallet().network(),
				profile,
			}),
		[profile, getWalletAlias, transaction],
	);

	return (
		<>
			<TransactionRowRecipientIcon recipient={transaction.recipient()} type={transaction.type()} />
			<div className={cn("w-0 flex-1", labelClass)}>
				<TransactionRowRecipientLabel transaction={transaction} walletName={alias} />
			</div>
		</>
	);
};
