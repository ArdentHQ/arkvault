import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useFormContext } from "react-hook-form";
import { FormField, FormLabel } from "@/app/components/Form";
import { StepHeader } from "@/app/components/StepHeader";
import { TextArea } from "@/app/components/TextArea";
import { Alert } from "@/app/components/Alert";
import { VerificationResult } from "@/domains/message/pages/VerifyMessage/VerifyMessage";
import { Icon } from "@/app/components/Icon";
import { Image } from "@/app/components/Image";

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

	const titleIcon = () => {
		if (!isVerified) {
			return (
				<Image
					name="ErrorHeaderIcon"
					domain="transaction"
					className="block h-[22px] w-[22px]"
					useAccentColor={false}
				/>
			)
		}

		return (
			<Icon
				className="text-theme-success-100 dark:text-theme-success-900"
				dimensions={[24, 24]}
				name="Completed"
				data-testid="icon-Completed"
			/>
		)

	}

	return (
		<section>
			<StepHeader title={getTitle()}
				titleIcon={titleIcon()}
			/>

			<Alert className="mt-6 sm:mt-4" variant={isVerified ? "success" : "danger"}>
				{getDescription()}
			</Alert>

			<div className="pt-6 sm:pt-4">
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
