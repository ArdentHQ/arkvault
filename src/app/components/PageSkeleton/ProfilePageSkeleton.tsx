import React from "react";
import { Skeleton } from "@/app/components/Skeleton";
import { Section } from "@/app/components/Layout";
import { Logo } from "@/app/components/Logo";

export const ProfilePageSkeleton: React.FC = () => (
	<div className="relative flex min-h-screen flex-col" data-testid="ProfilePageSkeleton">
		<div className="sticky inset-x-0 top-0 border-b border-theme-secondary-300 dark:border-theme-secondary-800">
			<div className="relative flex h-21">
				<div className="flex flex-1 justify-between px-8 sm:ml-12">
					<div className="my-auto mr-4 flex h-11 w-11 items-center justify-center rounded-xl bg-theme-success-600 pl-0.5 text-white">
						<Logo height={28} />
					</div>

					<div className="flex">
						<div className="my-auto flex items-center space-x-4">
							<Skeleton height={40} width={40} />
							<div className="h-8 border-r border-theme-secondary-300 dark:border-theme-secondary-800" />
						</div>

						<div className="my-auto ml-4 hidden items-center space-x-4 sm:flex">
							<Skeleton height={40} width={40} />
							<div className="h-8 border-r border-theme-secondary-300 dark:border-theme-secondary-800" />
							<Skeleton height={40} width={40} />
							<div className="h-8 border-r border-theme-secondary-300 dark:border-theme-secondary-800" />
						</div>

						<div className="my-auto ml-4 flex items-center">
							<div className="mx-4 hidden space-y-2 md:block">
								<p>
									<Skeleton width={80} height={16} />
								</p>
								<p>
									<Skeleton width={80} height={16} />
								</p>
							</div>

							<Skeleton circle width={44} height={44} />
						</div>
					</div>
				</div>
			</div>
		</div>

		<div className="flex flex-1 flex-col">
			<Section>
				<div className="w-full">
					<Skeleton height={24} />
				</div>
				<div className="my-4 w-2/3">
					<Skeleton height={24} />
				</div>
				<div className="w-1/4">
					<Skeleton height={24} />
				</div>
			</Section>
		</div>
	</div>
);
