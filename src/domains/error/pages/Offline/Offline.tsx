import React from "react";
import { useTranslation } from "react-i18next";

import { Image } from "@/app/components/Image";
import { Page, Section } from "@/app/components/Layout";

export const Offline = () => {
	const { t } = useTranslation();

	return (
		<Page pageTitle={t("ERROR.OFFLINE.TITLE")} navbarVariant="logo-only">
			<Section className="flex flex-1 flex-col justify-center text-center">
				<div className="mx-auto flex w-full max-w-xs justify-center">
					<Image name="ConnectionError" domain="error" />
				</div>

				<div data-testid="Offline__text" className="mt-8">
					<h2 className="text-2xl font-bold">{t("ERROR.OFFLINE.TITLE")}</h2>
					<p className="text-theme-secondary-text">{t("ERROR.OFFLINE.DESCRIPTION")}</p>
				</div>
			</Section>
		</Page>
	);
};
