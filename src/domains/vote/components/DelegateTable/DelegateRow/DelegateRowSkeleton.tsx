import React from "react";
import { Skeleton } from "@/app/components/Skeleton";

import { TableCell, TableRow } from "@/app/components/Table";
import { useRandomNumber } from "@/app/hooks";

interface DelegateRowSkeletonProperties {
	requiresStakeAmount?: boolean;
}

export const DelegateRowSkeleton = ({ requiresStakeAmount }: DelegateRowSkeletonProperties) => {
	const nameWidth = useRandomNumber(120, 150);

	return (
		<TableRow data-testid="DelegateRowSkeleton">
			<TableCell variant="start">
				<Skeleton height={16} width={22} />
			</TableCell>

			<TableCell innerClassName="h-12 space-x-3">
				<Skeleton height={16} width={nameWidth} />
			</TableCell>

			<TableCell variant="start" innerClassName="justify-center" className="hidden sm:table-cell">
				<Skeleton height={16} width={22} />
			</TableCell>

			<TableCell className="hidden sm:table-cell" innerClassName="justify-center">
				<Skeleton height={16} width={22} />
			</TableCell>

			{requiresStakeAmount && (
				<TableCell className="w-68" innerClassName="justify-center">
					<Skeleton height={34} width={220} className="align-middle" />
				</TableCell>
			)}

			<TableCell variant="end" className="w-40" innerClassName="justify-end">
				<Skeleton width={80} height={20} />
			</TableCell>
		</TableRow>
	);
};
