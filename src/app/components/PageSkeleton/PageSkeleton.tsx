import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { ThemeIcon } from "@/app/components/Icon";
import { Page, Section } from "@/app/components/Layout";
import { WelcomeSlider } from "@/domains/profile/components/WelcomeSlider/WelcomeSlider";
import { ProfileRowSkeleton } from "@/domains/profile/components/ProfileRow/ProfileRow";
import { Skeleton } from "@/app/components/Skeleton";
import cn from "classnames";
import { useTheme } from "@/app/hooks";

export const PageSkeleton = () => {
	const { t } = useTranslation();
	const { isDarkMode } = useTheme();

	return (
		<div data-testid="PageSkeleton">
			<Page navbarVariant="logo-only" pageTitle={t("COMMON.WELCOME")} title={<Trans i18nKey="COMMON.APP_NAME" />}>
				<Section
					className="-mt-5 flex flex-1 md:mt-0 xl:px-10"
					innerClassName="w-full lg:max-w-screen-xl"
					data-testid="PageSkeleton"
				>
					<div className="flex flex-col gap-3 lg:flex-row">
						<div
							className={cn(
								"border-theme-navy-100 dark:border-theme-secondary-800 dim:border-theme-dim-700 bg-theme-navy-50 dark:bg-theme-secondary-800 dim:bg-theme-dim-950 dim:bg-[url(/welcome-bg-dim.svg)] hidden min-w-0 basis-1/2 rounded-xl bg-[url(/welcome-bg-white.svg)] sm:block sm:border dark:bg-[url(/welcome-bg-dark.svg)]",
							)}
						>
							<div
								className={cn(
									"border-theme-navy-100 dark:border-theme-secondary-800 hidden min-w-0 basis-1/2 rounded-xl sm:block sm:border",
									{
										"bg-theme-navy-50 bg-[url(/welcome-bg-white.svg)]": !isDarkMode,
										"bg-theme-secondary-800 bg-[url(/welcome-bg-dark.svg)]": isDarkMode,
									},
								)}
							>
								<WelcomeSlider />
							</div>
						</div>

						<div className="border-theme-navy-100 dark:border-theme-secondary-800 dim:border-theme-dim-700 min-w-0 basis-1/2 rounded-xl sm:border sm:p-6">
							<div className="mx-auto flex h-[calc(100vh_-_160px)] max-w-[400px] flex-col sm:h-full">
								<div className="flex flex-1 flex-col items-center justify-center">
									<div className="flex flex-col items-center space-y-2 text-center sm:px-4">
										<ThemeIcon
											darkIcon="PersonDark"
											lightIcon="PersonLight"
											dimIcon="PersonDim"
											dimensions={[24, 24]}
										/>
									</div>

									<div className="mt-4 flex w-full flex-col items-center justify-center space-y-4">
										<Skeleton className="h-8" width={140} />
										<Skeleton className="block h-4" width={240} />
										<Skeleton className="block h-4" width={160} />
										<div className="w-full space-y-3">
											<ProfileRowSkeleton />
											<ProfileRowSkeleton />
										</div>
									</div>
								</div>

								<div className="fixed bottom-8 left-1/2 mt-8 w-full -translate-x-1/2 sm:static sm:bottom-0 sm:translate-x-0">
									<div className="h-6">
										<Skeleton className="h-3 w-3/5" />
									</div>
								</div>
							</div>
						</div>
					</div>
				</Section>
			</Page>
		</div>
	);
};
