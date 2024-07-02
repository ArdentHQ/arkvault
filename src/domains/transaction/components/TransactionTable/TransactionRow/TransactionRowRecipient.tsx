import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import cn from "classnames";
import React, { useMemo } from "react";

import { useWalletAlias } from "@/app/hooks/use-wallet-alias";

import { TransactionRowRecipientIcon } from "./TransactionRowRecipientIcon";
import { TransactionRowRecipientLabel } from "./TransactionRowRecipientLabel";

interface Properties {
	transaction: DTO.ExtendedConfirmedTransactionData;
	profile: Contracts.IProfile;
	isCompact: boolean;
	labelClass?: string;
}

export const TransactionRowRecipient = ({ transaction, profile, isCompact, labelClass }: Properties) => {
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
			<TransactionRowRecipientIcon
				recipient={transaction.recipient()}
				type={transaction.type()}
				isCompact={isCompact}
			/>
			<div className={cn("w-0 flex-1", labelClass)}>
				<TransactionRowRecipientLabel transaction={transaction} walletName={alias} />
			</div>
		</>
	);
};
