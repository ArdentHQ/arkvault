import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { ThemeIcon } from "@/app/components/Icon";
import { Page, Section } from "@/app/components/Layout";
import { WelcomeSlider } from "@/domains/profile/components/WelcomeSlider/WelcomeSlider";
import { ProfileRowSkeleton } from "@/domains/profile/components/ProfileRow/ProfileRow";
import { Skeleton } from "@/app/components/Skeleton";

export const PageSkeleton = () => {
	const { t } = useTranslation();
	return (
		<div data-testid="PageSkeleton">
			<Page navbarVariant="logo-only" pageTitle={t("COMMON.WELCOME")} title={<Trans i18nKey="COMMON.APP_NAME" />}>
				<Section
					className="flex flex-1 -mt-5 md:mt-0 xl:px-10"
					innerClassName="w-full lg:max-w-screen-xl"
					data-testid="PageSkeleton"
				>
					<div className="flex flex-col gap-3 lg:flex-row">
						<div className="border-theme-navy-100 bg-theme-navy-50 bg-[url( dark:border-theme-secondary-800 dark:bg-theme-secondary-800'/welcome-bg-white.svg')] hidden min-w-0 basis-1/2 rounded-xl border sm:block dark:bg-[url('/welcome-bg-dark.svg')]">
							<WelcomeSlider />
						</div>
						<div className="min-w-0 rounded-xl sm:p-6 sm:border border-theme-navy-100 basis-1/2 dark:border-theme-secondary-800">
							<div className="flex flex-col mx-auto sm:h-full h-[calc(100vh_-_160px)] max-w-[400px]">
								<div className="flex flex-col flex-1 justify-center items-center">
									<div className="flex flex-col items-center space-y-2 text-center sm:px-4">
										<ThemeIcon
											darkIcon="PersonDark"
											lightIcon="PersonLight"
											dimensions={[24, 24]}
										/>
									</div>

									<div className="flex flex-col justify-center items-center mt-4 space-y-4 w-full">
										<Skeleton className="h-8" width={140} />
										<Skeleton className="block h-4" width={240} />
										<Skeleton className="block h-4" width={160} />
										<div className="space-y-3 w-full">
											<ProfileRowSkeleton />
											<ProfileRowSkeleton />
										</div>
									</div>
								</div>

								<div className="fixed bottom-8 left-1/2 mt-8 w-full -translate-x-1/2 sm:static sm:bottom-0 sm:translate-x-0">
									<div className="h-6">
										<Skeleton className="w-3/5 h-3" />
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
