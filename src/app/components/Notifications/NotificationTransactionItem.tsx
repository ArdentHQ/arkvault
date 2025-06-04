import React, { useMemo } from "react";

import { NotificationTransactionItemProperties } from "./Notifications.contracts";
import { NotificationTransactionItemMobile } from "./NotificationTransactionItemMobile";
import { TableCell, TableRow } from "@/app/components/Table";
import { useWalletAlias, useBreakpoint } from "@/app/hooks";
import { TransactionRowRecipientLabel } from "@/domains/transaction/components/TransactionTable/TransactionRow/TransactionRowRecipientLabel";
import { AmountLabel } from "@/app/components/Amount";
import { TimeAgo } from "@/app/components/TimeAgo";
import { useNotifications } from "./hooks/use-notifications";

export const NotificationTransactionItem = ({
	transaction,
	profile,
	onTransactionClick,
}: NotificationTransactionItemProperties) => {
	const { getWalletAlias } = useWalletAlias();
	const { isXs, isSm } = useBreakpoint();
	const { isNotificationUnread } = useNotifications({ profile });

	const { alias } = useMemo(
		() =>
			getWalletAlias({
				address: transaction.to(),
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
				onTransactionClick={() => onTransactionClick?.(transaction)}
			/>
		);
	}
	const timestamp = transaction.timestamp();

	return (
		<TableRow onClick={() => onTransactionClick?.(transaction)} className="relative">
			<TableCell variant="start" className="w-2/5" innerClassName="pl-6 static mx-0">
				{isNotificationUnread(transaction) && (
					<div className="absolute top-0 bottom-0 flex items-center left-2">
						<div className="w-2 h-2 rounded-full bg-theme-danger-400" />
					</div>
				)}
				<div className="flex-1 w-20">
					<TransactionRowRecipientLabel transaction={transaction} walletName={alias} />
				</div>
			</TableCell>

			<TableCell innerClassName="text-theme-secondary-700 dark:text-theme-secondary-500 font-semibold justify-end whitespace-nowrap dim:text-theme-dim-200">
				{timestamp && <TimeAgo date={timestamp.toISOString()} />}
			</TableCell>

			<TableCell innerClassName="justify-end pr-6 static">
				<div className="h-5">
					<AmountLabel
						value={transaction.value()}
						isNegative={transaction.isSent()}
						ticker={transaction.wallet().currency()}
					/>
					<div className="absolute right-0 w-8 h-px bg-white dark:bg-theme-secondary-900 -bottom-px" />
				</div>
			</TableCell>
		</TableRow>
	);
};
