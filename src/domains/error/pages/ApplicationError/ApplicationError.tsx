import React from "react";
import { FallbackProps } from "react-error-boundary";
import { Trans, useTranslation } from "react-i18next";

import { Button } from "@/app/components/Button";
import { Image } from "@/app/components/Image";
import { Page, Section } from "@/app/components/Layout";
import { useTheme } from "@/app/hooks";
import { TextArea } from "@/app/components/TextArea";
import { ClipboardButton } from "@/app/components/Clipboard/ClipboardButton";

export const ApplicationError = ({ error }: Partial<FallbackProps>) => {
	const { t } = useTranslation();

	const { theme } = useTheme();

	return (
		<main className={theme} data-testid="Main">
			<Page pageTitle={t("COMMON.ERROR")} navbarVariant="logo-only" title={<Trans i18nKey="COMMON.APP_NAME" />}>
				<Section className="flex flex-1 flex-col justify-center text-center">
					<div className="mx-auto flex w-full max-w-xs justify-center">
						<Image name="GenericError" domain="error" />
					</div>

					<div data-testid="ApplicationError__text" className="mt-8">
						<h2 className="text-2xl font-bold capitalize">{t("ERROR.APPLICATION.TITLE")}</h2>
						<p className="text-theme-secondary-text">{t("ERROR.APPLICATION.DESCRIPTION")}</p>
						{error && <p className="text-theme-secondary-text">{t("ERROR.APPLICATION.HELP_TEXT")}</p>}
					</div>

					{error && (
						<div className="mx-auto mt-8 max-w-md">
							<TextArea
								data-testid="ErrorStep__errorMessage"
								className="py-4"
								initialHeight={70}
								defaultValue={error.message}
								disabled
							/>
						</div>
					)}

					<div className="mx-auto mt-8 flex max-w-md items-center justify-center space-x-4">
						{error && (<ClipboardButton data={String(error?.message)}>{t("COMMON.COPY")}</ClipboardButton>)}

						<Button data-testid="ApplicationError__button--reload" onClick={() => window.location.reload()}>
							{t("ERROR.APPLICATION.RELOAD")}
						</Button>
					</div>
				</Section>
			</Page>
		</main>
	);
};
