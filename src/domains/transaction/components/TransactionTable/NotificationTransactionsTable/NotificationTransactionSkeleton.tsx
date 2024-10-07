import React, { VFC } from "react";

import { NotificationTransactionSkeletonRow } from "./NotificationTransactionSkeletonRow";
import { NotificationTransactionsSkeletonProperties } from "./NotificationTransactionsTable.contracts";
import { Table } from "@/app/components/Table";

export const NotificationTransactionsSkeleton: VFC<NotificationTransactionsSkeletonProperties> = ({ limit = 10 }) => {
	const skeletonRows: any[] = Array.from({ length: limit }).fill({});

	return (
		<Table hideHeader columns={[{ Header: "-", className: "hidden" }]} data={skeletonRows}>
			{() => <NotificationTransactionSkeletonRow />}
		</Table>
	);
};
