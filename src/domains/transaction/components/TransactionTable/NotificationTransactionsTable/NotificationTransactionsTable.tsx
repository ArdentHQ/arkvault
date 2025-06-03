import { DTO } from "@/app/lib/profiles";
import React from "react";

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
	onClick,
	isLoading = true,
}: NotificationTransactionsProperties) => {
	const { isMdAndAbove } = useBreakpoint();

	if (isLoading) {
		return <NotificationTransactionsSkeleton />;
	}

	return (
		<div className="relative h-full">
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
						onTransactionClick={onClick}
					/>
				)}
			</Table>
		</div>
	);
};
