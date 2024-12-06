import React from "react";
import { Skeleton } from "@/app/components/Skeleton";

import { useRandomNumber } from "@/app/hooks";

export const DelegateRowMobileSkeleton = () => {
	const nameWidth = useRandomNumber(80, 120);

	return (
		<tr data-testid="DelegateRowMobileSkeleton">
			<td className="pt-3">
				<div className="w-full overflow-hidden rounded-xl border border-theme-secondary-300 dark:border-theme-secondary-800">
					<div className="overflow-hidden border-b border-theme-secondary-300 p-4 dark:border-theme-secondary-800">
						<div className="flex items-center justify-between">
							<div>
								<Skeleton height={17} width={nameWidth} />
							</div>
							<div>
								<Skeleton height={17} width={60} />
							</div>
						</div>
					</div>

					<div className="flex justify-center py-3">
						<Skeleton height={17} width={100} />
					</div>
				</div>
			</td>
		</tr>
	);
};
