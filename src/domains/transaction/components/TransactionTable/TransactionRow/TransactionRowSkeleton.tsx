import cn from "classnames";
import React from "react";

import { Circle } from "@/app/components/Circle";
import { Skeleton } from "@/app/components/Skeleton";
import { TableCell, TableRow } from "@/app/components/Table";
import { useRandomNumber } from "@/app/hooks";

type Properties = {
	isCompact: boolean;
} & React.HTMLProps<any>;

export const TransactionRowSkeleton = ({ isCompact }: Properties) => {
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
					<div className="mr-4 flex items-center space-x-2">
						<Skeleton circle height={20} width={20} />
						<Skeleton circle height={20} width={20} />
					</div>
				) : (
					<div className="mr-4 flex items-center -space-x-1">
						<Skeleton circle height={44} width={44} />
						<div className="z-0 flex ring-6 ring-theme-background rounded-full">
							<Skeleton circle height={44} width={44} />
						</div>
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

			<TableCell innerClassName="justify-end" isCompact={isCompact}>
				<span
					className={cn("flex h-7 items-center space-x-1", {
						"rounded border-2 border-theme-secondary-300 px-2 dark:border-theme-secondary-800": !isCompact,
					})}
				>
					<Skeleton height={16} width={amountWidth} />
					<Skeleton height={16} width={35} />
				</span>
			</TableCell>

			<TableCell variant="end" className="hidden xl:block" innerClassName="justify-end" isCompact={isCompact}>
				<span className="flex items-center space-x-1">
					<Skeleton height={16} width={currencyWidth} />
					<Skeleton height={16} width={35} />
				</span>
			</TableCell>
		</TableRow>
	);
};
