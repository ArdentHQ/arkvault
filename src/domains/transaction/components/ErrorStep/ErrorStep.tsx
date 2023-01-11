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
	isRepeatDisabled?: boolean;
	onBack?: () => void;
	onRepeat?: () => void;
	errorMessage?: string;
	noHeading?: boolean;
}

export const ErrorStep = ({
	title,
	description,
	onBack,
	onRepeat,
	isRepeatDisabled = false,
	errorMessage = "test",
	noHeading,
}: Properties) => {
	const { t } = useTranslation();
	const errorMessageReference = useRef();

	return (
		<div data-testid="ErrorStep">
			<div className="space-y-8">
				{!noHeading && <StepHeader title={title || t("TRANSACTION.ERROR.TITLE")} />}

				<Image name="TransactionErrorBanner" domain="transaction" className="hidden w-full md:block" />

				<div className="space-y-6">
					<p className="hidden text-theme-secondary-text md:block">
						{description || t("TRANSACTION.ERROR.DESCRIPTION")}
					</p>

					<Alert className="md:hidden" variant="danger">
						{description || t("TRANSACTION.ERROR.DESCRIPTION")}
					</Alert>

					{errorMessage && (
						<TextArea
							data-testid="ErrorStep__errorMessage"
							className="py-4"
							initialHeight={70}
							defaultValue={errorMessage}
							ref={errorMessageReference}
							disabled
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

				{!!onBack && (
					<Button onClick={onBack} data-testid="ErrorStep__wallet-button" variant="secondary">
						<div className="whitespace-nowrap">{t("COMMON.BACK_TO_WALLET")}</div>
					</Button>
				)}

				{!!onRepeat && (
					<Button
						data-testid="ErrorStep__repeat-button"
						disabled={isRepeatDisabled}
						onClick={() => onRepeat()}
					>
						<div className="whitespace-nowrap">{t("COMMON.RETRY")}</div>
					</Button>
				)}
			</FormButtons>
		</div>
	);
};
