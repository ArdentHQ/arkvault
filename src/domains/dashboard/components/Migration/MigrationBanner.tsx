import React from "react";
import { Button } from "@/app/components/Button";
import { Link } from "@/app/components/Link";
import { images } from "@/app/assets/images";
const { PolygonMigrationBannerDark, PolygonMigrationBannerLight } = images.common;
export const MigrationBanner = () => {
	const learnMoreClickHandler = () => {
		const link = "https://ardenthq.com/blog";
		window.open(link);
	};

	return (
		<div className="bg-theme-primary-100 text-theme-secondary-700 dark:bg-black dark:text-theme-secondary-500">
			<div className="flex items-center px-8 md:px-10 lg:container lg:mx-auto">
				<div className="max-w-2xl flex-1  py-6">
					<h3 className="font-bold text-theme-secondary-900 dark:text-theme-secondary-200">
						ARK is Moving to 0xPolygon!
					</h3>
					<p className="leading-7">
						Users can now migrate their tokens to the new ERC20 token on 0xPolygon. Find out more in our{" "}
						<Link to="https://docs.arkvault.io/" isExternal>
							Migration Guide
						</Link>
						.
					</p>
					<div className="mt-8 flex space-x-3 ">
						<Button variant="primary">Migrate Tokens</Button>
						<Button variant="secondary-alt" onClick={learnMoreClickHandler}>
							Learn More
						</Button>
					</div>
				</div>

				<div className="hidden w-[304px] flex-shrink-0 pt-2 pb-4 md:block lg:w-[475px]">
					<PolygonMigrationBannerLight className="block w-full dark:hidden" />
					<PolygonMigrationBannerDark className="hidden w-full dark:block" />
				</div>
			</div>
		</div>
	);
};
