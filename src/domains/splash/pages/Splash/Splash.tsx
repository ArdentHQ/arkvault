import { DateTime } from "@payvo/sdk-intl";
import React from "react";
import { useTranslation } from "react-i18next";
import tw, { styled } from "twin.macro";
import { version } from "../../../../../package.json"; // eslint-disable-line import/no-relative-parent-imports
import { CircularProgressBar } from "@/app/components/CircularProgressBar";
import { Divider } from "@/app/components/Divider";
import { Image } from "@/app/components/Image";
import { Page, Section } from "@/app/components/Layout";
import { shouldUseDarkColors } from "@/utils/theme";
import { Logo } from "@/app/components/Logo";

const LogoContainer = styled.div`
	${tw`flex items-center justify-center w-5 h-5 mr-2 pl-px rounded text-theme-background bg-theme-secondary-500 dark:bg-theme-secondary-700`};
`;

export const Splash = ({ year }: any) => {
	const { t } = useTranslation();

	const currentYear = year || DateTime.make().format("YYYY");

	return (
		<Page navbarVariant="logo-only">
			<Section className="flex flex-1 select-none flex-col justify-center text-center">
				<div className="mx-auto flex max-w-md justify-center">
					<Image name="WelcomeBanner" className="max-w-full" />
				</div>

				<div data-testid="Splash__text" className="mt-8">
					<h1 className="text-4xl font-extrabold">{t("SPLASH.BRAND")}</h1>
					<p className="animate-pulse text-theme-secondary-text">{t("SPLASH.LOADING")}</p>
					<div className="mt-4 flex justify-center">
						<div className="animate-spin">
							<CircularProgressBar
								showValue={false}
								value={20}
								strokeColor={
									shouldUseDarkColors()
										? "var(--theme-color-secondary-800)"
										: "var(--theme-color-success-200)"
								}
								strokeWidth={2}
								size={40}
								progressColor="var(--theme-color-primary-600)"
							/>
						</div>
					</div>
				</div>
				<div
					data-testid="Splash__footer"
					className="fixed right-0 left-0 bottom-5 flex items-center justify-center text-xs font-semibold text-theme-secondary-500 dark:text-theme-secondary-700"
				>
					<div>
						{currentYear} {t("SPLASH.COPYRIGHT")}
					</div>

					<Divider type="vertical" />

					<div>{t("SPLASH.RIGHTS")}</div>

					<Divider type="vertical" />

					<LogoContainer>
						<Logo height={12} />
					</LogoContainer>

					<div>{t("SPLASH.PRODUCT")}</div>

					<Divider type="vertical" />

					<div>
						{t("SPLASH.VERSION")} {version}
					</div>
				</div>
			</Section>
		</Page>
	);
};
