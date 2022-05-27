import React from "react";

import { Skeleton } from "@/app/components/Skeleton";
import { TableCell, TableRow } from "@/app/components/Table";
import { useRandomNumber } from "@/app/hooks";

export const UnlockTokensRowSkeleton: React.FC = () => {
	const amountWidth = useRandomNumber(100, 130);
	const timeWidth = useRandomNumber(160, 200);

	return (
		<TableRow>
			<TableCell variant="start" isCompact>
				<Skeleton width={amountWidth} height={16} />
			</TableCell>

			<TableCell isCompact>
				<Skeleton width={timeWidth} height={16} />
			</TableCell>

			<TableCell variant="end" isCompact innerClassName="justify-end">
				<div className="flex items-center">
					<Skeleton width={80} height={16} />
					<Skeleton width={20} height={20} className="mr-3 ml-2" />
					<Skeleton width={20} height={20} />
				</div>
			</TableCell>
		</TableRow>
	);
};
