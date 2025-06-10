import React from "react";
import { Skeleton } from "@/app/components/Skeleton";
import { Section } from "@/app/components/Layout";
import { Logo } from "@/app/components/Logo";

const MenuItemSkeleton = ({ isCircle = false }: { isCircle?: boolean }) => (
	<div>
		<Skeleton height={28} width={28} circle={isCircle} />
	</div>
);

export const ProfilePageSkeleton: React.FC = () => (
	<div className="relative flex min-h-screen flex-col" data-testid="ProfilePageSkeleton">
		<div className="border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-b-theme-dim-700 sticky inset-x-0 top-0 border-b">
			<div className="relative flex h-12 items-center">
				<div className="flex flex-1 justify-between px-6 sm:ml-7 sm:px-8">
					<div className="bg-theme-primary-600 my-auto flex h-6 w-6 items-center justify-center rounded-md text-white">
						<Logo height={16} />
					</div>

					<div className="flex">
						<div className="my-auto flex items-center space-x-4 sm:hidden">
							<MenuItemSkeleton />
							<div className="border-theme-secondary-300 dark:border-theme-dark-700 h-6 border-r" />
						</div>

						<div className="my-auto ml-4 hidden items-center space-x-4 sm:flex">
							<Skeleton height={28} width={28} className="hidden sm:flex" />
							<div className="border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-r-theme-dim-700 hidden h-6 border-r sm:flex sm:h-12" />
							<Skeleton height={28} width={28} className="hidden sm:flex" />
							<div className="border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-r-theme-dim-700 hidden h-6 border-r sm:flex sm:h-12" />
							<Skeleton height={28} width={28} className="hidden sm:flex" />
							<div className="border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-r-theme-dim-700 hidden h-6 border-r sm:flex sm:h-12" />
							<Skeleton height={28} width={28} className="hidden sm:flex" />
							<div className="border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-r-theme-dim-700 hidden h-6 border-r sm:flex sm:h-12" />
						</div>

						<div className="my-auto ml-4 flex items-center">
							<div className="mx-4 hidden space-y-2 md:block">
								<p>
									<Skeleton width={80} height={12} />
								</p>
								<p>
									<Skeleton width={80} height={12} />
								</p>
							</div>

							<MenuItemSkeleton isCircle />
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
