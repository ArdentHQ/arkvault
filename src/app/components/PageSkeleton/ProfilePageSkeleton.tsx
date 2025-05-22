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
	<div className="flex relative flex-col min-h-screen" data-testid="ProfilePageSkeleton">
		<div className="sticky inset-x-0 top-0 border-b border-theme-secondary-300 dark:border-theme-secondary-800">
			<div className="flex relative items-center h-12">
				<div className="flex flex-1 justify-between px-6 sm:px-8 sm:ml-7">
					<div className="flex justify-center items-center my-auto w-6 h-6 text-white rounded-md bg-theme-primary-600">
						<Logo height={16} />
					</div>

					<div className="flex">
						<div className="flex items-center my-auto space-x-4 sm:hidden">
							<MenuItemSkeleton />
							<div className="h-6 border-r border-theme-secondary-300 dark:border-theme-dark-700" />
						</div>

						<div className="hidden items-center my-auto ml-4 space-x-4 sm:flex">
							<Skeleton height={28} width={28} className="hidden sm:flex" />
							<div className="hidden h-6 border-r sm:flex sm:h-12 border-theme-secondary-300 dark:border-theme-secondary-800" />
							<Skeleton height={28} width={28} className="hidden sm:flex" />
							<div className="hidden h-6 border-r sm:flex sm:h-12 border-theme-secondary-300 dark:border-theme-secondary-800" />
							<Skeleton height={28} width={28} className="hidden sm:flex" />
							<div className="hidden h-6 border-r sm:flex sm:h-12 border-theme-secondary-300 dark:border-theme-secondary-800" />
							<Skeleton height={28} width={28} className="hidden sm:flex" />
							<div className="hidden h-6 border-r sm:flex sm:h-12 border-theme-secondary-300 dark:border-theme-secondary-800" />
						</div>

						<div className="flex items-center my-auto ml-4">
							<div className="hidden mx-4 space-y-2 md:block">
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

		<div className="flex flex-col flex-1">
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
