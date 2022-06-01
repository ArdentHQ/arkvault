import React, { VFC } from "react";
import { useTranslation } from "react-i18next";

import { NotificationTransactionSkeletonRow } from "./NotificationTransactionSkeletonRow";
import { NotificationTransactionsSkeletonProperties } from "./NotificationTransactionsTable.contracts";
import { Table } from "@/app/components/Table";

export const NotificationTransactionsSkeleton: VFC<NotificationTransactionsSkeletonProperties> = ({
	limit = 10,
	isCompact,
}) => {
	const { t } = useTranslation();

	const skeletonRows: any[] = Array.from({ length: limit }).fill({});

	return (
		<div>
			<div className="space-y-2">
				<div className="text-base font-semibold text-theme-secondary-500">
					{t("COMMON.NOTIFICATIONS.TRANSACTIONS_TITLE")}
				</div>

				<Table hideHeader columns={[{ Header: "-", className: "hidden" }]} data={skeletonRows}>
					{() => <NotificationTransactionSkeletonRow isCompact={isCompact} />}
				</Table>
			</div>
		</div>
	);
};
