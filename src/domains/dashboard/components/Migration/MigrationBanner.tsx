import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/app/hooks";
import { Button } from "@/app/components/Button";
import { Link } from "@/app/components/Link";
import { Image } from "@/app/components/Image";
import { useLink } from "@/app/hooks/use-link";

export const MigrationBanner = () => {
	const { t } = useTranslation();
	const { openExternal } = useLink();
	const { isDarkMode } = useTheme();

	return (
		<div
			data-testid="MigrationBanner"
			className="mb-4 bg-theme-primary-100 text-theme-secondary-700 dark:border-theme-secondary-800 dark:bg-theme-secondary-900 dark:text-theme-secondary-500 sm:mb-0 sm:dark:bg-black"
		>
			<div className="flex items-center px-8 md:px-10 lg:container lg:mx-auto">
				<div className="max-w-2xl flex-1 py-6">
					<h2 className="text-lg text-theme-secondary-900 dark:text-theme-secondary-200 md:text-2xl">
						{t("DASHBOARD.MIGRATION_BANNER.TITLE")}
					</h2>

					<div className="leading-7">
						{t("DASHBOARD.MIGRATION_BANNER.DESCRIPTION")}{" "}
						<Link to="https://docs.arkvault.io/" isExternal>
							{t("DASHBOARD.MIGRATION_BANNER.MIGRATION_GUIDE")}
						</Link>
						.
					</div>

					<div className="mt-8 flex space-x-3 ">
						<Button variant="primary">{t("DASHBOARD.MIGRATION_BANNER.MIGRATE_TOKENS")}</Button>
						<Button
							data-testid="MigrationBanner--learnmore"
							variant="secondary-alt"
							onClick={() => openExternal("https://ardenthq.com/blog")}
						>
							{t("COMMON.LEARN_MORE")}
						</Button>
					</div>
				</div>

				<div className="hidden w-[304px] flex-shrink-0 pt-2 pb-4 md:block lg:w-[475px]">
					<Image name="PolygonMigrationBanner" useAccentColor={!isDarkMode} />
				</div>
			</div>
		</div>
	);
};
