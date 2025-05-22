import React from "react";

import { Card } from "@/app/components/Card";
import { Skeleton } from "@/app/components/Skeleton";
import { useRandomNumber } from "@/app/hooks";

export const ExchangeCardSkeleton = () => {
	const nameWidth = useRandomNumber(100, 180);

	return (
		<div data-testid="ExchangeCardSkeleton">
			<Card>
				<div className="flex overflow-auto flex-col items-center space-y-3 md:flex-row md:space-y-0 md:space-x-3">
					<div className="overflow-hidden w-11 h-11 rounded-xl shrink-0">
						<Skeleton width={44} height={44} />
					</div>

					<div className="flex overflow-auto flex-col max-w-full">
						<Skeleton height={18} width={nameWidth} className="overflow-auto max-w-full" />
					</div>
				</div>
			</Card>
		</div>
	);
};
