import React, { useRef } from "react";
import { useTranslation } from "react-i18next";

import { Alert } from "@/app/components/Alert";
import { Button } from "@/app/components/Button";
import { Clipboard } from "@/app/components/Clipboard";
import { Icon } from "@/app/components/Icon";
import { Image } from "@/app/components/Image";
import { StepHeader } from "@/app/components/StepHeader";
import { FormButtons } from "@/app/components/Form";
import { TextArea } from "@/app/components/TextArea";

interface Properties {
	title?: string;
	description?: string;
	isBackDisabled?: boolean;
	onClose?: () => void;
	onBack?: () => void;
	errorMessage?: string;
}

export const ErrorStep = ({
	title,
	description,
	onBack,
	onClose,
	isBackDisabled = false,
	errorMessage = "test",
}: Properties) => {
	const { t } = useTranslation();
	const errorMessageReference = useRef();

	return (
		<div data-testid="ErrorStep">
			<div className="space-y-2">
				<div className="flex flex-row items-center justify-start gap-3">
					<StepHeader
						title={title || t("TRANSACTION.ERROR.TITLE")}
						titleIcon={
							<Image
								name="ErrorHeaderIcon"
								domain="transaction"
								className="block h-[22px] w-[22px]"
								useAccentColor={false}
							/>
						}
					/>
				</div>

				<div className="space-y-4">
					<p className="hidden text-theme-secondary-text md:block">
						{description || t("TRANSACTION.ERROR.DESCRIPTION")}
					</p>

					<Alert className="md:hidden" variant="danger">
						{description || t("TRANSACTION.ERROR.DESCRIPTION")}
					</Alert>

					{errorMessage ? (
						<TextArea
							data-testid="ErrorStep__errorMessage"
							className="py-4"
							initialHeight={70}
							defaultValue={errorMessage}
							ref={errorMessageReference}
							disabled
						/>
					) : (
						<Image
							name="TransactionErrorBanner"
							domain="transaction"
							className="mx-auto mt-4 block w-full max-w-[400px]"
							useAccentColor={false}
						/>
					)}
				</div>
			</div>

			<FormButtons>
				{errorMessage && (
					<div className="mr-auto">
						<Clipboard variant="button" data={errorMessage}>
							<Icon name="Copy" size="lg" />
							<span className="hidden sm:block">{t("COMMON.COPY_ERROR")}</span>
						</Clipboard>
					</div>
				)}

				{!!onClose && (
					<Button onClick={() => onClose()} data-testid="ErrorStep__close-button" variant="secondary">
						<div className="whitespace-nowrap">{t("COMMON.CLOSE")}</div>
					</Button>
				)}

				{!!onBack && (
					<Button data-testid="ErrorStep__back-button" disabled={isBackDisabled} onClick={() => onBack()}>
						<div className="whitespace-nowrap">{t("COMMON.BACK")}</div>
					</Button>
				)}
			</FormButtons>
		</div>
	);
};
