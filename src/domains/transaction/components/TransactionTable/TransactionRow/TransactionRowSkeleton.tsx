import React from "react";

import { Skeleton } from "@/app/components/Skeleton";
import { TableCell, TableRow } from "@/app/components/Table";
import { useRandomNumber } from "@/app/hooks";

export const TransactionRowSkeleton = () => {
	const recipientWidth = useRandomNumber(120, 150);
	const amountWidth = useRandomNumber(80, 100);
	const currencyWidth = Math.floor(amountWidth * 0.75);

	return (
		<TableRow>
			<TableCell variant="start">
				<Skeleton width={80} height={17} />
			</TableCell>

			<TableCell className="table-cell md:hidden lg:table-cell">
				<Skeleton width={80} height={17} />
			</TableCell>

			<TableCell>
				<div className="flex items-center">
					<Skeleton width={80} height={17} />
				</div>
			</TableCell>

			<TableCell>
				<div className="mr-2">
					<Skeleton height={17} width={37} />
				</div>
				<Skeleton height={17} width={recipientWidth} />
			</TableCell>

			<TableCell innerClassName="justify-end">
				<Skeleton width={amountWidth} height={17} />
			</TableCell>

			<TableCell variant="end" className="hidden xl:block" innerClassName="justify-end">
				<Skeleton width={currencyWidth} height={17} />
			</TableCell>
		</TableRow>
	);
};
