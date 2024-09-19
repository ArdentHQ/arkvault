import React from "react";

import { Skeleton } from "@/app/components/Skeleton";
import { TableRow } from "@/app/components/Table";
import { useRandomNumber } from "@/app/hooks";
import { MobileCard } from "@/app/components/Table/Mobile/MobileCard";

export const TransactionRowMobileSkeleton = () => {
	const amountWidth = useRandomNumber(100, 130);
	const recipientWidth = useRandomNumber(130, 150);
	const currencyWidth = Math.floor(amountWidth * 0.75);

	return (
		<TableRow className="group !border-b-0">
			<td data-testid="TransactionRow__skeleton">
				<MobileCard className="mb-3">
					<div className="flex h-10 w-full items-center justify-between bg-theme-secondary-100 px-4 dark:bg-black">
						<Skeleton height={17} width={70} />
						<Skeleton height={17} width={70} />
					</div>

					<div className="flex w-full flex-col gap-4 px-4 pb-4 pt-3 sm:grid sm:grid-cols-[200px_auto_130px] sm:pb-2">
						<div className="flex flex-col gap-2">
							<Skeleton height={17} width={70} />
							<Skeleton height={17} width={recipientWidth} />
						</div>
						<div className="flex flex-col gap-2">
							<Skeleton height={17} width={70} />
							<Skeleton height={17} width={amountWidth} />
						</div>
						<div className="flex flex-col gap-2">
							<Skeleton height={17} width={70} />
							<Skeleton height={17} width={currencyWidth} />
						</div>
					</div>
				</MobileCard>
			</td>
		</TableRow>
	);
};
