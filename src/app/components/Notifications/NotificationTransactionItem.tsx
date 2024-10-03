import React, { useMemo } from "react";
import VisibilitySensor from "react-visibility-sensor";

import { NotificationTransactionItemProperties } from "./Notifications.contracts";
import { NotificationTransactionItemMobile } from "./NotificationTransactionItemMobile";
import { TableCell, TableRow } from "@/app/components/Table";
import { useWalletAlias, useBreakpoint } from "@/app/hooks";
import { TransactionRowAmount } from "@/domains/transaction/components/TransactionTable/TransactionRow/TransactionRowAmount";
import { TransactionRowMode } from "@/domains/transaction/components/TransactionTable/TransactionRow/TransactionRowMode";
import { TransactionRowRecipientLabel } from "@/domains/transaction/components/TransactionTable/TransactionRow/TransactionRowRecipientLabel";
import { Amount, AmountLabel } from "../Amount";
import { TimeAgo } from "@/app/components/TimeAgo";
import { useNotifications } from "./hooks/use-notifications";

export const NotificationTransactionItem = ({
	transaction,
	profile,
	onVisibilityChange,
	containmentRef,
	onTransactionClick,
}: NotificationTransactionItemProperties) => {
	const { getWalletAlias } = useWalletAlias();
	const { isXs, isSm } = useBreakpoint();
	const { isNotificationUnread } = useNotifications({ profile });

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
	const timestamp = transaction.timestamp()

	return (
		<VisibilitySensor onChange={onVisibilityChange} scrollCheck delayedCall containment={containmentRef?.current}>
			<TableRow onClick={() => onTransactionClick?.(transaction)} className="relative">
				<TableCell variant="start" className="w-2/5" innerClassName="pl-8 static">
					{isNotificationUnread(transaction) && <div className="absolute left-4 top-0 bottom-0 flex items-center"><div className="w-2 h-2 rounded-full bg-theme-danger-400" /></div>}
					<div className="absolute w-8 h-px left-0 -bottom-px bg-white dark:bg-theme-secondary-900" />
					<div className="w-20 flex-1">
						<TransactionRowRecipientLabel transaction={transaction} walletName={alias} />
					</div>
				</TableCell>

				<TableCell innerClassName="text-theme-secondary-700 dark:text-theme-secondary-500 font-semibold justify-end whitespace-nowrap">
					{timestamp &&
						<TimeAgo date={timestamp.toISOString()} />
					}
				</TableCell>

				<TableCell innerClassName="justify-end my-0 py-3 pr-8 static">
					<div>
						<AmountLabel
							value={transaction.amount()}
							isNegative={transaction.isSent()}
							ticker={transaction.wallet().currency()}
						/>
						<div className="absolute w-8 h-px right-0 -bottom-px bg-white dark:bg-theme-secondary-900" />
					</div>
				</TableCell>

			</TableRow>
		</VisibilitySensor>
	);
};
