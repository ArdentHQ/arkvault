import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Alert } from "@/app/components/Alert";
import { SmAndAbove } from "@/app/components/Breakpoint";
import { FormField, FormLabel } from "@/app/components/Form";
import { Image } from "@/app/components/Image";
import { StepHeader } from "@/app/components/StepHeader";
import { TextArea } from "@/app/components/TextArea";
import { VerificationResult } from "@/domains/message/pages/VerifyMessage/VerifyMessage";

export const SuccessStep = ({ verificationResult }: { verificationResult?: VerificationResult }) => {
	const { t } = useTranslation();

	const isVerified = verificationResult?.verified;

	const { setError } = useFormContext();

	useEffect(() => {
		if (!isVerified) {
			setError("json-signature", { type: "manual" });
		}
	}, [isVerified, setError]);

	const getTitle = () => {
		if (isVerified) {
			return t("MESSAGE.PAGE_VERIFY_MESSAGE.SUCCESS_STEP.VERIFIED.TITLE");
		}

		return t("MESSAGE.PAGE_VERIFY_MESSAGE.SUCCESS_STEP.NOT_VERIFIED.TITLE");
	};

	const getDescription = () => {
		if (isVerified) {
			return t("MESSAGE.PAGE_VERIFY_MESSAGE.SUCCESS_STEP.VERIFIED.DESCRIPTION");
		}

		return t("MESSAGE.PAGE_VERIFY_MESSAGE.SUCCESS_STEP.NOT_VERIFIED.DESCRIPTION");
	};

	return (
		<section>
			<StepHeader title={getTitle()} />

			<SmAndAbove>
				<Image
					name={isVerified ? "Success" : "Error"}
					className="mx-auto mt-8 h-26"
					useAccentColor={isVerified}
				/>
			</SmAndAbove>

			<Alert className="mt-6 sm:mt-8" variant={isVerified ? "success" : "danger"}>
				{getDescription()}
			</Alert>

			<div className="pt-4 md:pt-6">
				<FormField name="json-signature">
					<FormLabel label={t("MESSAGE.PAGE_VERIFY_MESSAGE.FORM_STEP.JSON_STRING")} />
					<TextArea
						className="py-4"
						wrap="hard"
						defaultValue={JSON.stringify({
							message: verificationResult?.message,
							signatory: verificationResult?.signatory,
							signature: verificationResult?.signature,
						})}
						disabled
					/>
				</FormField>
			</div>
		</section>
	);
};
