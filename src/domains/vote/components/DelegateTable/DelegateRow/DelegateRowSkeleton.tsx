import cn from "classnames";
import React from "react";
import { Skeleton } from "@/app/components/Skeleton";

import { TableCell, TableRow } from "@/app/components/Table";
import { useRandomNumber } from "@/app/hooks";

interface DelegateRowSkeletonProperties {
	requiresStakeAmount?: boolean;
	isCompact?: boolean;
}

export const DelegateRowSkeleton = ({ requiresStakeAmount, isCompact }: DelegateRowSkeletonProperties) => {
	const nameWidth = useRandomNumber(120, 150);

	return (
		<TableRow data-testid="DelegateRowSkeleton">
			<TableCell variant="start" isCompact={isCompact}>
				<Skeleton height={16} width={22} />
			</TableCell>

			<TableCell
				innerClassName={cn({ "h-12 space-x-3": isCompact }, { "space-x-4": !isCompact })}
				isCompact={isCompact}
			>
				<Skeleton height={16} width={nameWidth} />
			</TableCell>

			<TableCell
				variant="start"
				innerClassName="justify-center"
				className="hidden sm:table-cell"
				isCompact={isCompact}
			>
				<Skeleton height={16} width={22} />
			</TableCell>

			<TableCell className="hidden sm:table-cell" innerClassName="justify-center" isCompact={isCompact}>
				<Skeleton height={16} width={22} />
			</TableCell>

			{requiresStakeAmount && (
				<TableCell className="w-68" innerClassName="justify-center" isCompact={isCompact}>
					<Skeleton height={isCompact ? 34 : 56} width={220} className="align-middle" />
				</TableCell>
			)}

			<TableCell variant="end" className="w-40" innerClassName="justify-end" isCompact={isCompact}>
				<Skeleton width={isCompact ? 80 : 100} height={isCompact ? 20 : 40} />
			</TableCell>
		</TableRow>
	);
};
