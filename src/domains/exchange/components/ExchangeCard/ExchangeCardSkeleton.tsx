import React from "react";

import { Card } from "@/app/components/Card";
import { Skeleton } from "@/app/components/Skeleton";
import { useRandomNumber } from "@/app/hooks";

export const ExchangeCardSkeleton = () => {
	const nameWidth = useRandomNumber(100, 180);

	return (
		<div data-testid="ExchangeCardSkeleton">
			<Card>
				<div className="flex flex-col items-center space-y-3 overflow-auto md:flex-row md:space-x-3 md:space-y-0">
					<div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl">
						<Skeleton width={44} height={44} />
					</div>

					<div className="flex max-w-full flex-col overflow-auto">
						<Skeleton height={18} width={nameWidth} className="max-w-full overflow-auto" />
					</div>
				</div>
			</Card>
		</div>
	);
};
