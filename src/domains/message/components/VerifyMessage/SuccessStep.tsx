import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FormField, FormLabel } from "@/app/components/Form";
import { Alert } from "@/app/components/Alert";
import { TextArea } from "@/app/components/TextArea";
import { useFormContext } from "react-hook-form";
import { VerificationResult } from "@/domains/message/components/VerifyMessage/VerifyMessageSidePanel";

export const SuccessStep = ({ verificationResult }: { verificationResult?: VerificationResult }) => {
	const { t } = useTranslation();

	const isVerified = verificationResult?.verified;

	const { setError } = useFormContext();

	useEffect(() => {
		if (!isVerified) {
			setError("json-signature", { type: "manual" });
		}
	}, [isVerified, setError]);

	const getDescription = () => {
		if (isVerified) {
			return t("MESSAGE.PAGE_VERIFY_MESSAGE.SUCCESS_STEP.VERIFIED.DESCRIPTION");
		}

		return t("MESSAGE.PAGE_VERIFY_MESSAGE.SUCCESS_STEP.NOT_VERIFIED.DESCRIPTION");
	};

	return (
		<section>
			<Alert variant={isVerified ? "success" : "danger"}>{getDescription()}</Alert>

			<div className="pt-6 sm:pt-4">
				<FormField name="json-signature">
					<FormLabel label={t("MESSAGE.PAGE_VERIFY_MESSAGE.FORM_STEP.SIGNATURE_JSON")} />
					<TextArea
						className="py-4"
						wrap="hard"
						rows={5}
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
