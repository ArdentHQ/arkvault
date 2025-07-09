import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import { StepHeader } from "@/app/components/StepHeader";
import { VerificationMethod } from "@/domains/message/pages/VerifyMessage/VerifyMessage";
import { FormField, FormLabel } from "@/app/components/Form";
import { InputDefault } from "@/app/components/Input";
import { TextArea } from "@/app/components/TextArea";
import { useValidation } from "@/app/hooks";
import { Switch } from "@/app/components/Switch";
import { ThemeIcon } from "@/app/components/Icon";

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
			<FormField name="signatory">
				<FormLabel label={t("COMMON.SIGNATORY")} />
				<InputDefault data-testid="VerifyMessage__manual-signatory" ref={register(verifyMessage.signatory())} />
			</FormField>

			<FormField name="message">
				<FormLabel label={t("COMMON.MESSAGE")} />
				<InputDefault data-testid="VerifyMessage__manual-message" ref={register(verifyMessage.message())} />
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
		<section>
			<StepHeader
				title={t("MESSAGE.PAGE_VERIFY_MESSAGE.FORM_STEP.TITLE")}
				subtitle={t("MESSAGE.PAGE_VERIFY_MESSAGE.FORM_STEP.DESCRIPTION")}
				titleIcon={
					<ThemeIcon
						dimensions={[24, 24]}
						lightIcon="SendTransactionLight"
						darkIcon="SendTransactionDark"
						dimIcon="SendTransactionDim"
					/>
				}
			/>

			<div className="border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 mt-6 flex flex-col overflow-hidden rounded-sm border sm:rounded-xl">
				<div className="flex flex-row justify-between p-4">
					<span className="text-theme-secondary-700 dark:text-theme-secondary-700 dim:text-theme-dim-700 text-sm font-semibold sm:hidden">
						{t("MESSAGE.PAGE_VERIFY_MESSAGE.FORM_STEP.VERIFICATION_METHOD.TITLE")}:
					</span>

					<span className="text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50 hidden text-base font-semibold sm:block">
						{t("MESSAGE.PAGE_VERIFY_MESSAGE.FORM_STEP.VERIFICATION_METHOD.FULL_TITLE")}
					</span>

					<Switch
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
				</div>
				<div className="bg-theme-secondary-100 dim:bg-theme-dim-950 hidden px-4 pt-3 pb-3 sm:block dark:bg-black">
					<span className="text-theme-secondary-text dim:text-theme-dim-200 text-sm font-normal">
						{t("MESSAGE.PAGE_VERIFY_MESSAGE.FORM_STEP.VERIFICATION_METHOD.DESCRIPTION")}
					</span>
				</div>
			</div>

			{method === VerificationMethod.Json ? <JsonForm /> : <ManualForm />}
		</section>
	);
};
