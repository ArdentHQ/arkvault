import { DTO } from "@ardenthq/sdk-profiles";
import React from "react";
import VisibilitySensor from "react-visibility-sensor";

import { NotificationTransactionItem } from "@/app/components/Notifications";
import { Table } from "@/app/components/Table";
import {
	NotificationTransactionsProperties,
	NotificationTransactionsSkeleton,
} from "@/domains/transaction/components/TransactionTable/NotificationTransactionsTable";

export const NotificationTransactionsTable = ({
	profile,
	transactions,
	containmentRef,
	onClick,
	isLoading = true,
	onVisibilityChange,
}: NotificationTransactionsProperties) => {
	const isCompact = !profile.appearance().get("useExpandedTables");

	if (isLoading) {
		return <NotificationTransactionsSkeleton isCompact={isCompact} />;
	}

	return (
		<VisibilitySensor
			onChange={(isVisible) => onVisibilityChange?.(isVisible)}
			scrollCheck
			delayedCall
			containment={containmentRef?.current}
		>
			<Table hideHeader columns={[{ Header: "-", className: "hidden" }]} data={transactions}>
				{(transaction: DTO.ExtendedConfirmedTransactionData) => (
					<NotificationTransactionItem
						transaction={transaction}
						profile={profile}
						containmentRef={containmentRef}
						onTransactionClick={onClick}
						isCompact={isCompact}
					/>
				)}
			</Table>
		</VisibilitySensor>
	);
};
