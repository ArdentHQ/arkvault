import { DTO } from "@/app/lib/profiles";
import React from "react";
import VisibilitySensor from "react-visibility-sensor";

import { NotificationTransactionItem } from "@/app/components/Notifications";
import { Table } from "@/app/components/Table";
import {
	NotificationTransactionsProperties,
	NotificationTransactionsSkeleton,
} from "@/domains/transaction/components/TransactionTable/NotificationTransactionsTable";
import { useBreakpoint } from "@/app/hooks";
import cn from "classnames";

export const NotificationTransactionsTable = ({
	profile,
	transactions,
	containmentRef,
	onClick,
	isLoading = true,
	onVisibilityChange,
}: NotificationTransactionsProperties) => {
	const { isMdAndAbove } = useBreakpoint();

	if (isLoading) {
		return <NotificationTransactionsSkeleton />;
	}

	return (
		<div className="relative h-full">
			<VisibilitySensor
				onChange={(isVisible) => onVisibilityChange?.(isVisible)}
				scrollCheck
				delayedCall
				containment={containmentRef?.current}
			>
				<Table
					hideHeader
					columns={[{ Header: "-", className: "hidden" }]}
					data={transactions}
					className={cn({ "with-x-padding": isMdAndAbove })}
				>
					{(transaction: DTO.ExtendedConfirmedTransactionData) => (
						<NotificationTransactionItem
							transaction={transaction}
							profile={profile}
							containmentRef={containmentRef}
							onTransactionClick={onClick}
						/>
					)}
				</Table>
			</VisibilitySensor>
		</div>
	);
};
