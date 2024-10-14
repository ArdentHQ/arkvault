import React from "react";
import { Skeleton } from "@/app/components/Skeleton";
import { Section } from "@/app/components/Layout";
import { Logo } from "@/app/components/Logo";

const MenuItemSkeleton = ({ isCircle = false }: { isCircle?: boolena }) => (
	<div>
		<div className="hidden sm:visible" >
			<Skeleton height={40} width={40} circle={isCircle}/>
		</div>

		<div className="visible sm:hidden" >
			<Skeleton height={25} width={25} circle={isCircle}/>
		</div>
	</div>
)

export const ProfilePageSkeleton: React.FC = () => (
	<div className="relative flex min-h-screen flex-col" data-testid="ProfilePageSkeleton">
		<div className="sticky inset-x-0 top-0 border-b border-theme-secondary-300 dark:border-theme-secondary-800">
			<div className="relative flex h-14 sm:h-21">
				<div className="flex flex-1 justify-between px-6 sm:px-8 sm:ml-12">
					<div className="my-auto mr-4 flex h-8 sm:h-11 w-8 sm:w-11 items-center justify-center rounded-md sm:rounded-xl bg-theme-primary-600 text-white">
						<div className="hidden sm:block"><Logo height={28} /></div>
						<div className="block sm:hidden"><Logo height={23} /></div>
					</div>

					<div className="flex">
						<div className="my-auto flex items-center space-x-4">
							<MenuItemSkeleton />
							<div className="h-8 border-r border-theme-secondary-300 dark:border-theme-secondary-800" />
						</div>

						<div className="my-auto ml-4 hidden items-center space-x-4 sm:flex">
							<Skeleton height={40} width={40} className="hidden sm:visible" />
							<div className="h-8 border-r border-theme-secondary-300 dark:border-theme-secondary-800" />
							<Skeleton height={40} width={40} className="hidden sm:visible" />
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
