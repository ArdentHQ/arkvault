import React from "react";
import { Page, Section } from "@/app/components/Layout";
import { Skeleton } from "@/app/components/Skeleton";

export const PageSkeleton: React.FC = () => (
	<div data-testid="PageSkeleton">
		<Page navbarVariant="logo-only" title="Payvo Wallet">
			<Section className="-mt-5 flex flex-1 flex-col text-center md:mt-0 md:justify-center">
				<div className="mx-auto hidden w-96 md:block">
					<Skeleton height={230} />
				</div>
				<div className="flex flex-col items-center md:mt-8">
					<h2>
						<Skeleton width={100} height={32} />
					</h2>
					<p>
						<Skeleton width={240} height={24} />
					</p>
					<div className="mt-6 w-full sm:w-40 md:mt-8">
						<Skeleton height={160} />
					</div>
					<p className="mt-8 md:mt-16">
						<Skeleton width={280} height={24} />
					</p>
				</div>
			</Section>
		</Page>
	</div>
);
