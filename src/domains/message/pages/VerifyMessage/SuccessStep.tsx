import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { useFormContext } from "react-hook-form";
import { FormField, FormLabel } from "@/app/components/Form";
import { StepHeader } from "@/app/components/StepHeader";
import { TextArea } from "@/app/components/TextArea";
import { Alert } from "@/app/components/Alert";
import { Image } from "@/app/components/Image";
import { VerificationResult } from "@/domains/message/pages/VerifyMessage/VerifyMessage";

export const SuccessStep = ({ verificationResult }: { verificationResult?: VerificationResult }) => {
	const { t } = useTranslation();

	const signatureReference = useRef();

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

			<Image name={isVerified ? "SuccessBanner" : "ErrorBanner"} className="my-8 w-full" />

			<Alert variant={isVerified ? "success" : "danger"}>{getDescription()}</Alert>

			<div className="pt-4 md:pt-6">
				<FormField name="json-signature">
					<FormLabel label={t("MESSAGE.PAGE_VERIFY_MESSAGE.FORM_STEP.JSON_STRING")} />
					<TextArea
						className="py-4"
						name="signature"
						wrap="hard"
						ref={signatureReference}
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
