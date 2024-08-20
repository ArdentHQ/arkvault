import React from "react";
import { Trans, useTranslation } from "react-i18next";

import { Image } from "@/app/components/Image";
import { Page, Section } from "@/app/components/Layout";
import { Button } from "@/app/components/Button";

export const Offline = () => {
	const { t } = useTranslation();

	return (
		<Page pageTitle={t("ERROR.OFFLINE.TITLE")} navbarVariant="logo-only" title={<Trans i18nKey="COMMON.APP_NAME" />}>
			<Section className="flex flex-1 flex-col justify-center !pt-0 text-center">
				<div className="mx-auto flex w-full max-w-xs justify-center">
					<Image name="ConnectionError" domain="error" />
				</div>

				<div data-testid="Offline__text" className="mt-6">
					<h2 className="text-2xl font-bold">{t("ERROR.OFFLINE.TITLE")}</h2>
					<p className="text-theme-secondary-text">{t("ERROR.OFFLINE.DESCRIPTION")}</p>
				</div>

				<div className="mt-4">
					<Button variant="primary" data-testid="Offline__button" onClick={() => window.location.reload()}>
						{t("COMMON.RELOAD")}
					</Button>
				</div>
			</Section>
		</Page>
	);
};
