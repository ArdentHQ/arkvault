import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/app/components/Button";
import { Link } from "@/app/components/Link";
import { images } from "@/app/assets/images";
const { PolygonMigrationBannerDark, PolygonMigrationBannerLight } = images.common;
const learnMoreClickHandler = () => {
	const link = "https://ardenthq.com/blog";
	window.open(link);
};
export const MigrationBanner = () => {
	const { t } = useTranslation();

	return (
		<div
			data-testid="MigrationBanner"
			className="bg-theme-primary-100 text-theme-secondary-700 dark:bg-black dark:text-theme-secondary-500"
		>
			<div className="flex items-center px-8 md:px-10 lg:container lg:mx-auto">
				<div className="max-w-2xl flex-1  py-6">
					<h3 className="font-bold text-theme-secondary-900 dark:text-theme-secondary-200">
						{t("COMMON.MIGRATION_BANNER.TITLE")}
					</h3>
					<div className="leading-7">
						{t("COMMON.MIGRATION_BANNER.DESCRIPTION")}{" "}
						<Link to="https://docs.arkvault.io/" isExternal>
							{t("COMMON.MIGRATION_BANNER.MIGRATION_GUIDE")}
						</Link>
						.
					</div>
					<div className="mt-8 flex space-x-3 ">
						<Button variant="primary">{t("COMMON.MIGRATION_BANNER.MIGRATE_TOKENS")}</Button>
						<Button variant="secondary-alt" onClick={learnMoreClickHandler}>
							{t("COMMON.LEARN_MORE")}
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
