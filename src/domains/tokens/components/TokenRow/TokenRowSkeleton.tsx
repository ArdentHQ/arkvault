import React from "react";

import { Skeleton } from "@/app/components/Skeleton";
import { TableCell, TableRow } from "@/app/components/Table";
import { useRandomNumber } from "@/app/hooks";

export const TokenRowSkeleton = () => {
	const nameWidth = useRandomNumber(100, 140);
	const symbolWidth = useRandomNumber(60, 80);
	const contractWidth = useRandomNumber(120, 160);
	const balanceWidth = useRandomNumber(80, 120);

	return (
		<TableRow>
			<TableCell variant="start">
				<div className="flex flex-row items-center gap-3">
					<Skeleton circle width={20} height={20} />
					<Skeleton width={nameWidth} height={17} />
				</div>
			</TableCell>

			<TableCell className="md-lg:table-cell hidden">
				<Skeleton width={symbolWidth} height={17} />
			</TableCell>

			<TableCell>
				<div className="flex flex-row items-center gap-2">
					<Skeleton width={contractWidth} height={17} />
				</div>
			</TableCell>

			<TableCell innerClassName="justify-end">
				<Skeleton width={balanceWidth} height={17} />
			</TableCell>

			<TableCell innerClassName="justify-center" className="hidden lg:table-cell">
				<Skeleton width={60} height={17} />
			</TableCell>

			<TableCell variant="end" innerClassName="justify-end">
				<Skeleton width={45} height={17} />
			</TableCell>
		</TableRow>
	);
};
