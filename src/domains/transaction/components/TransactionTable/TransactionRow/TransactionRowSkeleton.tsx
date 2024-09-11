import React from "react";

import { Skeleton } from "@/app/components/Skeleton";
import { TableCell, TableRow } from "@/app/components/Table";
import { useRandomNumber } from "@/app/hooks";

export const TransactionRowSkeleton = () => {
	const senderWidth = useRandomNumber(120, 150);
	const recipientWidth = useRandomNumber(120, 150);
	const amountWidth = useRandomNumber(100, 130);
	const currencyWidth = Math.floor(amountWidth * 0.75);

	return (
		<TableRow>
			<TableCell variant="start">
				<Skeleton width={16} height={16} />
			</TableCell>

			<TableCell className="table-cell md:hidden lg:table-cell">
				<Skeleton height={16} width={150} />
			</TableCell>

			<TableCell>
				<div className="mr-4 flex items-center space-x-2">
					<Skeleton circle height={20} width={20} />
					<Skeleton circle height={20} width={20} />
				</div>
				<Skeleton height={16} width={senderWidth} />
			</TableCell>

			<TableCell>
				<div className="mr-4">
					<Skeleton circle height={20} width={20} />
				</div>
				<Skeleton height={16} width={recipientWidth} />
			</TableCell>

			<TableCell innerClassName="justify-end">
				<span
					className="flex h-7 items-center space-x-1"
				>
					<Skeleton height={16} width={amountWidth} />
					<Skeleton height={16} width={35} />
				</span>
			</TableCell>

			<TableCell variant="end" className="hidden xl:block" innerClassName="justify-end">
				<span className="flex items-center space-x-1">
					<Skeleton height={16} width={currencyWidth} />
					<Skeleton height={16} width={35} />
				</span>
			</TableCell>
		</TableRow>
	);
};
