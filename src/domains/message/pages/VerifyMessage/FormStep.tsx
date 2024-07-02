import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { FormField, FormLabel } from "@/app/components/Form";
import { InputDefault } from "@/app/components/Input";
import { StepHeader } from "@/app/components/StepHeader";
import { Switch } from "@/app/components/Switch";
import { TextArea } from "@/app/components/TextArea";
import { useValidation } from "@/app/hooks";
import { VerificationMethod } from "@/domains/message/pages/VerifyMessage/VerifyMessage";

const JsonForm = () => {
	const { t } = useTranslation();

	const { register, unregister } = useFormContext();

	const { verifyMessage } = useValidation();

	useEffect(() => () => unregister("jsonString"), [unregister]);

	return (
		<div data-testid="VerifyMessage__json" className="mt-4">
			<FormField name="jsonString">
				<FormLabel label={t("MESSAGE.PAGE_VERIFY_MESSAGE.FORM_STEP.JSON_STRING")} />
				<TextArea
					data-testid="VerifyMessage__json-jsonString"
					className="py-4"
					initialHeight={90}
					placeholder={t("MESSAGE.PAGE_VERIFY_MESSAGE.FORM_STEP.JSON_PLACEHOLDER")}
					ref={register(verifyMessage.jsonString())}
				/>
			</FormField>
		</div>
	);
};

const ManualForm = () => {
	const { t } = useTranslation();

	const { register, unregister } = useFormContext();

	const { verifyMessage } = useValidation();

	useEffect(() => () => unregister(["signatory", "message", "signature"]), [unregister]);

	return (
		<div data-testid="VerifyMessage__manual" className="mt-4 space-y-5">
			<FormField name="message">
				<FormLabel label={t("COMMON.MESSAGE")} />
				<InputDefault data-testid="VerifyMessage__manual-message" ref={register(verifyMessage.message())} />
			</FormField>

			<FormField name="signatory">
				<FormLabel label={t("COMMON.SIGNATORY")} />
				<InputDefault data-testid="VerifyMessage__manual-signatory" ref={register(verifyMessage.signatory())} />
			</FormField>

			<FormField name="signature">
				<FormLabel label={t("COMMON.SIGNATURE")} />
				<InputDefault data-testid="VerifyMessage__manual-signature" ref={register(verifyMessage.signature())} />
			</FormField>
		</div>
	);
};

export const FormStep = ({
	method,
	onMethodChange,
}: {
	method: VerificationMethod;
	onMethodChange: (value: VerificationMethod) => void;
}) => {
	const { t } = useTranslation();

	return (
		<section className="space-y-5">
			<StepHeader
				title={t("MESSAGE.PAGE_VERIFY_MESSAGE.FORM_STEP.TITLE")}
				subtitle={t("MESSAGE.PAGE_VERIFY_MESSAGE.FORM_STEP.DESCRIPTION")}
			/>

			<span className="mb-1 hidden text-lg font-semibold sm:block">
				{t("MESSAGE.PAGE_VERIFY_MESSAGE.FORM_STEP.VERIFICATION_METHOD.TITLE")}
			</span>

			<span className="hidden text-sm font-medium text-theme-secondary-500 dark:text-theme-secondary-700 sm:block">
				{t("MESSAGE.PAGE_VERIFY_MESSAGE.FORM_STEP.VERIFICATION_METHOD.DESCRIPTION")}
			</span>

			<Switch
				size="lg"
				className="sm:mt-6"
				value={method}
				onChange={onMethodChange}
				leftOption={{
					label: t("MESSAGE.PAGE_VERIFY_MESSAGE.FORM_STEP.VERIFICATION_METHOD.JSON"),
					value: VerificationMethod.Json,
				}}
				rightOption={{
					label: t("MESSAGE.PAGE_VERIFY_MESSAGE.FORM_STEP.VERIFICATION_METHOD.MANUAL"),
					value: VerificationMethod.Manual,
				}}
			/>

			{method === VerificationMethod.Json ? <JsonForm /> : <ManualForm />}
		</section>
	);
};
