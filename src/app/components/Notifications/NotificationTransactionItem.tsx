import React, { useMemo } from "react";
import VisibilitySensor from "react-visibility-sensor";

import { NotificationTransactionItemProperties } from "./Notifications.contracts";
import { NotificationTransactionItemMobile } from "./NotificationTransactionItemMobile";
import { TableCell, TableRow } from "@/app/components/Table";
import { useWalletAlias, useBreakpoint } from "@/app/hooks";
import { TransactionRowAmount } from "@/domains/transaction/components/TransactionTable/TransactionRow/TransactionRowAmount";
import { TransactionRowMode } from "@/domains/transaction/components/TransactionTable/TransactionRow/TransactionRowMode";
import { TransactionRowRecipientLabel } from "@/domains/transaction/components/TransactionTable/TransactionRow/TransactionRowRecipientLabel";

export const NotificationTransactionItem = ({
	transaction,
	profile,
	onVisibilityChange,
	containmentRef,
	onTransactionClick,
}: NotificationTransactionItemProperties) => {
	const { getWalletAlias } = useWalletAlias();
	const { isXs, isSm } = useBreakpoint();

	const { alias } = useMemo(
		() =>
			getWalletAlias({
				address: transaction.recipient(),
				network: transaction.wallet().network(),
				profile,
			}),
		[profile, getWalletAlias, transaction],
	);

	if (isXs || isSm) {
		return (
			<NotificationTransactionItemMobile
				transaction={transaction}
				profile={profile}
				containmentRef={containmentRef?.current}
				onTransactionClick={() => onTransactionClick?.(transaction)}
			/>
		);
	}

	return (
		<VisibilitySensor onChange={onVisibilityChange} scrollCheck delayedCall containment={containmentRef?.current}>
			<TableRow onClick={() => onTransactionClick?.(transaction)}>
				<TableCell variant="start" className="w-3/5" innerClassName="flex space-x-3">
					<TransactionRowMode transaction={transaction} address={transaction.recipient()} />
					<div className="w-20 flex-1">
						<TransactionRowRecipientLabel transaction={transaction} walletName={alias} />
					</div>
				</TableCell>

				<TableCell variant="end" innerClassName="justify-end">
					<TransactionRowAmount transaction={transaction} />
				</TableCell>
			</TableRow>
		</VisibilitySensor>
	);
};
