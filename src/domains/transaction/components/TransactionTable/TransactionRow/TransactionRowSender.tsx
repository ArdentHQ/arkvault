import cn from "classnames";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React, { useMemo } from "react";
import { TransactionRowMode } from "./TransactionRowMode";
import { Size } from "@/types";
import { Address } from "@/app/components/Address";
import { useBreakpoint, useWalletAlias } from "@/app/hooks";

interface Properties {
	transaction: DTO.ExtendedConfirmedTransactionData;
	profile: Contracts.IProfile;
	isCompact: boolean;
	labelClass?: string;
	showTransactionMode?: boolean;
	addressSize?: Size | undefined;
}

export const TransactionRowSender = ({
	transaction,
	profile,
	isCompact,
	labelClass,
	addressSize,
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
				<TransactionRowMode transaction={transaction} transactionType="transfer" isCompact={isCompact} />
			)}
			<div className={cn("w-0 flex-1", labelClass)}>
				<Address
					size={addressSize}
					walletName={alias}
					address={transaction.sender()}
					alignment={isXs || isSm ? "right" : undefined}
				/>
			</div>
		</>
	);
};
