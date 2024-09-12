import React from "react";

import { Skeleton } from "@/app/components/Skeleton";
import { TableCell, TableRow } from "@/app/components/Table";
import { useRandomNumber, useBreakpoint } from "@/app/hooks";
import { NotificationTransactionItemMobileSkeleton } from "@/app/components/Notifications/NotificationTransactionItemMobileSkeleton";

export const NotificationTransactionSkeletonRow = () => {
	const recipientWidth = useRandomNumber(120, 150);
	const amountWidth = useRandomNumber(100, 130);
	const { isXs, isSm } = useBreakpoint();

	const renderTransactionMode = () => (
		<div className="flex items-center space-x-2">
			<Skeleton circle height={20} width={20} />
			<Skeleton circle height={20} width={20} />
		</div>
	);

	if (isXs || isSm) {
		return <NotificationTransactionItemMobileSkeleton />;
	}

	return (
		<TableRow>
			<TableCell variant="start" innerClassName="space-x-3">
				{renderTransactionMode()}

				<Skeleton height={16} width={recipientWidth} />
			</TableCell>

			<TableCell variant="end" innerClassName="justify-end">
				<span className="flex h-7 items-center space-x-1 rounded border border-theme-secondary-300 px-2 dark:border-theme-secondary-800">
					<Skeleton height={16} width={amountWidth} />
					<Skeleton height={16} width={35} />
				</span>
			</TableCell>
		</TableRow>
	);
};
