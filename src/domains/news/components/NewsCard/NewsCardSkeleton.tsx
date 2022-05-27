import React from "react";

import { Circle } from "@/app/components/Circle";
import { Divider } from "@/app/components/Divider";
import { Skeleton } from "@/app/components/Skeleton";
import { useRandomNumber } from "@/app/hooks";

export const NewsCardSkeleton = () => {
	const titleWidth = useRandomNumber(100, 150);
	const positionWidth = useRandomNumber(80, 120);
	const lineWidth = useRandomNumber(30, 100);

	return (
		<div className="relative h-full w-full cursor-default border-b border-theme-primary-100 bg-theme-background p-3 text-left transition-colors-shadow duration-200 dark:border-theme-secondary-800 md:rounded-lg md:border-2 md:border-b-2 md:p-5">
			<div className="flex flex-col space-y-6 p-5" data-testid="NewsCard__skeleton">
				<div className="flex w-full items-center items-stretch justify-between">
					<div className="flex items-center">
						<div className="relative mr-4 hidden h-12 items-center justify-center md:flex">
							<Skeleton circle width={44} height={44} />
							<Circle className="absolute border-transparent bg-theme-background" noShadow />
						</div>

						<div className="flex flex-col justify-between">
							<div className="flex items-center md:gap-x-4">
								<div className="flex items-center md:hidden">
									<div className="flex items-center space-x-2 md:hidden">
										<Skeleton height={18} width={20} />
										<Skeleton height={18} width={positionWidth} />
									</div>

									<Divider type="vertical" />

									<Skeleton height={14} width={60} />
								</div>

								<div className="hidden flex-col space-y-2 md:flex">
									<Skeleton height={18} width={titleWidth} />
									<Skeleton height={14} width={positionWidth} />
								</div>
							</div>
						</div>
					</div>

					<div className="self-strech flex flex-col justify-end">
						<Skeleton height={28} width={60} />
					</div>
				</div>

				<Divider />

				<div className="flex flex-col space-y-2">
					<Skeleton height={16} width="100%" />
					<Skeleton height={16} width="100%" />
					<Skeleton height={16} width={`${lineWidth}%`} />
				</div>
			</div>
		</div>
	);
};
