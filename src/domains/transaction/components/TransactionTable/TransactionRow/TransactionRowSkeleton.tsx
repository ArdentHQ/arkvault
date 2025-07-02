import React from "react";

import { Skeleton } from "@/app/components/Skeleton";
import { TableCell, TableRow } from "@/app/components/Table";
import { useRandomNumber } from "@/app/hooks";

export const TransactionRowSkeleton = ({ hideSender = false }: { hideSender?: boolean }) => {
	const recipientWidth = useRandomNumber(120, 150);
	const senderWidth = useRandomNumber(120, 150);
	const amountWidth = useRandomNumber(100, 120);
	const currencyWidth = Math.floor(amountWidth * 0.45);

	return (
		<TableRow className="max-xl:h-[4.25rem]">
			<TableCell variant="start">
				<div className="hidden xl:block">
					<Skeleton width={90} height={17} />
				</div>

				<div className="flex flex-col max-xl:pt-2 xl:hidden">
					<Skeleton width={90} height={13} />
					<div className="mt-1">
						<Skeleton width={68} height={10} />
					</div>
				</div>
			</TableCell>

			<TableCell className="table-cell sm:hidden xl:table-cell">
				<Skeleton width={70} height={16} />
			</TableCell>

			<TableCell>
				<div className="flex items-center">
					<Skeleton width={80} height={16} />
				</div>
			</TableCell>

			<TableCell>
				<div className="flex flex-col gap-1">
					<div className="flex flex-row gap-2">
						<Skeleton height={17} width={37} />
						<Skeleton height={17} width={senderWidth} />
					</div>
					{!hideSender && (
						<div
							className="md-lg:hidden flex flex-row gap-2"
							data-testid="TransactionRowSkeleton__recipient-mobile"
						>
							<Skeleton height={17} width={37} />
							<Skeleton height={17} width={recipientWidth} />
						</div>
					)}
				</div>
			</TableCell>

			{!hideSender && (
				<TableCell className="md-lg:table-cell hidden" data-testid="TransactionRowSkeleton__sender-desktop">
					<div className="flex flex-row gap-2">
						<Skeleton height={17} width={37} />
						<Skeleton height={17} width={senderWidth} />
					</div>
				</TableCell>
			)}

			<TableCell innerClassName="justify-end" className="table-cell sm:hidden lg:table-cell">
				<div className="border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-theme-dim-800 rounded border p-1 px-2">
					<Skeleton height={14} width={amountWidth} />
				</div>
			</TableCell>

			<TableCell variant="end" className="hidden md:table-cell" innerClassName="justify-end">
				<div className="hidden lg:block">
					<Skeleton width={currencyWidth} height={17} />
				</div>

				<div className="-mr-3 flex flex-col items-end pt-px lg:hidden">
					<div className="border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-theme-dim-800 rounded border p-[2px]">
						<Skeleton height={15} width={amountWidth} />
					</div>
					<div className="mt-px">
						<Skeleton width={50} height={9} />
					</div>
				</div>
			</TableCell>
		</TableRow>
	);
};
