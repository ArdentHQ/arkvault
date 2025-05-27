import React from "react";

import { NotificationTransactionSkeletonRow } from "./NotificationTransactionSkeletonRow";
import { NotificationTransactionsSkeletonProperties } from "./NotificationTransactionsTable.contracts";
import { Table } from "@/app/components/Table";

export const NotificationTransactionsSkeleton = ({ limit = 10 }: NotificationTransactionsSkeletonProperties) => {
	const skeletonRows: any[] = Array.from({ length: limit }).fill({});

	return (
		<Table hideHeader columns={[{ Header: "-", className: "hidden" }]} data={skeletonRows}>
			{() => <NotificationTransactionSkeletonRow />}
		</Table>
	);
};
