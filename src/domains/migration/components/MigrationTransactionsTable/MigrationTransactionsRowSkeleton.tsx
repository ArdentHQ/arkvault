import React from "react";

import { Skeleton } from "@/app/components/Skeleton";
import { TableCell, TableRow } from "@/app/components/Table";
import { useRandomNumber } from "@/app/hooks";

type Properties = {
	isCompact: boolean;
} & React.HTMLProps<any>;

export const MigrationTransactionsRowSkeleton = ({ isCompact }: Properties) => {
	const senderWidth = useRandomNumber(120, 150);
	const recipientWidth = useRandomNumber(120, 150);
	const amountWidth = useRandomNumber(100, 130);
	const currencyWidth = Math.floor(amountWidth * 0.75);

	return (
		<TableRow>
			<TableCell variant="start" isCompact={isCompact}>
				<Skeleton width={16} height={16} />
			</TableCell>

			<TableCell isCompact={isCompact} className="table-cell md:hidden lg:table-cell">
				<Skeleton height={16} width={150} />
			</TableCell>

			<TableCell isCompact={isCompact}>
				{isCompact ? (
					<div className="mr-4 flex items-center">
						<Skeleton circle height={20} width={20} />
					</div>
				) : (
					<div className="mr-4 flex items-center">
						<Skeleton circle height={44} width={44} />
					</div>
				)}

				<Skeleton height={16} width={senderWidth} />
			</TableCell>

			<TableCell isCompact={isCompact}>
				{isCompact ? (
					<div className="mr-4">
						<Skeleton circle height={20} width={20} />
					</div>
				) : (
					<div className="mr-4">
						<Skeleton circle height={44} width={44} />
					</div>
				)}

				<Skeleton height={16} width={recipientWidth} />
			</TableCell>

			<TableCell innerClassName="justify-center" isCompact={isCompact}>
				<Skeleton circle height={20} width={20} />
			</TableCell>

			<TableCell innerClassName="justify-end" isCompact={isCompact}>
				<span className="flex items-center space-x-1">
					<Skeleton height={16} width={currencyWidth} />
					<Skeleton height={16} width={35} />
				</span>
			</TableCell>

			<TableCell variant="end" innerClassName="justify-center" isCompact={isCompact}>
				{isCompact ? <Skeleton height={16} width={140} /> : <Skeleton height={44} width={140} />}
			</TableCell>
		</TableRow>
	);
};
