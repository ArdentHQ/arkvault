import React from "react";

import { Skeleton } from "@/app/components/Skeleton";
import { TableRow } from "@/app/components/Table";
import { useRandomNumber } from "@/app/hooks";
import { MobileCard } from "@/app/components/Table/Mobile/MobileCard";
import { Divider } from "@/app/components/Divider";

export const TokenRowMobileSkeleton = () => {
	const tokenNameWidth = useRandomNumber(60, 90);
	const balanceWidth = useRandomNumber(100, 140);
	const valueWidth = useRandomNumber(80, 110);
	const contractWidth = useRandomNumber(120, 150);

	return (
		<TableRow className="group border-b-0!">
			<td data-testid="TokenRow__skeleton">
				<MobileCard className="mb-3">
					<div className="bg-theme-secondary-100 dim:bg-theme-dim-950 flex h-10 w-full items-center justify-between pr-3 pl-4 sm:pl-3 dark:bg-black">
						<div className="flex flex-row items-center gap-3">
							<div className="hidden flex-row items-center sm:flex">
								<Skeleton height={16} width={16} className="mr-2 rounded-full" />
								<Divider
									type="vertical"
									className="border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-theme-dim-700 m-0 h-[17px]"
								/>
							</div>

							<Skeleton height={20} width={20} className="rounded-full" />
							<Skeleton height={17} width={tokenNameWidth} />
						</div>

						<Skeleton height={17} width={40} />
					</div>

					<div className="flex w-full flex-col gap-4 px-4 pt-3 pb-4 sm:grid sm:grid-cols-[200px_auto_180px] sm:pb-4">
						<div className="flex flex-col gap-2">
							<Skeleton height={17} width={90} />
							<Skeleton height={17} width={balanceWidth} />
						</div>
						<div className="flex flex-col gap-2">
							<Skeleton height={17} width={50} />
							<Skeleton height={17} width={valueWidth} />
						</div>
						<div className="flex flex-col gap-2">
							<Skeleton height={17} width={70} />
							<Skeleton height={17} width={contractWidth} />
						</div>

						<div className="border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-theme-dim-700 border-t border-dashed pt-4 sm:hidden">
							<div className="flex flex-row items-center gap-2">
								<Skeleton height={20} width={20} className="rounded-full" />
								<Skeleton height={17} width={60} />
							</div>
						</div>
					</div>
				</MobileCard>
			</td>
		</TableRow>
	);
};
