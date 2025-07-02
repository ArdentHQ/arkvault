import React from "react";

import { Skeleton } from "@/app/components/Skeleton";
import { TableCell, TableRow } from "@/app/components/Table";
import { useRandomNumber, useBreakpoint } from "@/app/hooks";
import { NotificationTransactionItemMobileSkeleton } from "@/app/components/Notifications/NotificationTransactionItemMobileSkeleton";

export const NotificationTransactionSkeletonRow = () => {
	const recipientWidth = useRandomNumber(120, 150);
	const amountWidth = useRandomNumber(60, 80);
	const { isXs, isSm } = useBreakpoint();

	if (isXs || isSm) {
		return <NotificationTransactionItemMobileSkeleton />;
	}

	return (
		<TableRow className="relative">
			<TableCell variant="start" className="w-2/5" innerClassName="pl-8 static">
				<Skeleton height={16} width={recipientWidth} />
			</TableCell>

			<TableCell innerClassName="text-theme-secondary-700 dark:text-theme-secondary-500 font-semibold justify-end whitespace-nowrap dim:text-theme-dim-200">
				<Skeleton height={16} width={40} />
			</TableCell>

			<TableCell innerClassName="justify-end pr-8 static">
				<span className="border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-theme-dim-700 flex h-7 items-center space-x-1 rounded border px-2">
					<Skeleton height={16} width={amountWidth} />
					<Skeleton height={16} width={35} />
				</span>
			</TableCell>
		</TableRow>
	);
};
