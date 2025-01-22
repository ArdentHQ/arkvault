import React from "react";

import { Skeleton } from "@/app/components/Skeleton";

export const WalletVoteSkeleton = () => (
	<div
		data-testid="WalletVote__skeleton"
		className="flex flex-col rounded-xl border border-theme-secondary-300 bg-theme-secondary-100 dark:border-theme-secondary-800 dark:bg-black md:border-0 md:bg-transparent md:dark:bg-transparent"
	>
		<div className="flex h-[1.688rem] w-full items-center px-8 py-4 md:p-0">
			<div className="flex space-x-2">
				<Skeleton height={16} width={250} />
				<Skeleton height={16} width={50} />
			</div>

			<div className="ml-auto">
				<Skeleton height={22} width={62} />
			</div>
		</div>

		<div className="flex justify-center border-t border-theme-secondary-300 px-6 py-4 dark:border-theme-secondary-800 md:hidden">
			<div className="flex h-10 flex-col items-center justify-between">
				<Skeleton height={16} width={150} />
				<Skeleton height={14} width={100} />
			</div>
		</div>
	</div>
);
