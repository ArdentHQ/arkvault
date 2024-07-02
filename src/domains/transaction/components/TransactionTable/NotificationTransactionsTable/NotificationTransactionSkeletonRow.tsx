import cn from "classnames";
import React, { VFC } from "react";

import { NotificationTransactionItemMobileSkeleton } from "@/app/components/Notifications/NotificationTransactionItemMobileSkeleton";
import { Skeleton } from "@/app/components/Skeleton";
import { TableCell, TableRow } from "@/app/components/Table";
import { useBreakpoint, useRandomNumber } from "@/app/hooks";

import { NotificationTransactionSkeletonRowProperties } from "./NotificationTransactionsTable.contracts";

export const NotificationTransactionSkeletonRow: VFC<NotificationTransactionSkeletonRowProperties> = ({
	isCompact,
}) => {
	const recipientWidth = useRandomNumber(120, 150);
	const amountWidth = useRandomNumber(100, 130);
	const { isXs, isSm } = useBreakpoint();

	const renderTransactionMode = () => {
		if (isCompact) {
			return (
				<div className="flex items-center space-x-2">
					<Skeleton circle height={20} width={20} />
					<Skeleton circle height={20} width={20} />
				</div>
			);
		}

		return (
			<div className="flex items-center -space-x-1">
				<Skeleton circle height={44} width={44} />
				<div className="z-0 flex rounded-full ring-6 ring-theme-background">
					<Skeleton circle height={44} width={44} />
				</div>
			</div>
		);
	};

	if (isXs || isSm) {
		return <NotificationTransactionItemMobileSkeleton />;
	}

	return (
		<TableRow>
			<TableCell
				variant="start"
				innerClassName={cn({ "space-x-3": isCompact }, { "space-x-4": !isCompact })}
				isCompact={isCompact}
			>
				{renderTransactionMode()}

				<Skeleton height={16} width={recipientWidth} />
			</TableCell>

			<TableCell variant="end" innerClassName="justify-end" isCompact={isCompact}>
				<span className="flex h-7 items-center space-x-1 rounded border border-theme-secondary-300 px-2 dark:border-theme-secondary-800">
					<Skeleton height={16} width={amountWidth} />
					<Skeleton height={16} width={35} />
				</span>
			</TableCell>
		</TableRow>
	);
};
