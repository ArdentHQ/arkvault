import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { FormField, FormLabel } from "@/app/components/Form";
import { InputDefault } from "@/app/components/Input";
import { useValidation } from "@/app/hooks";
import { TextArea } from "@/app/components/TextArea";
import { Switch } from "@/app/components/Switch";
import { VerificationMethod } from "@/domains/message/components/VerifyMessage/VerifyMessageSidePanel";

const JsonForm = () => {
	const { t } = useTranslation();

	const { register, unregister } = useFormContext();

	const { verifyMessage } = useValidation();

	useEffect(() => () => unregister("jsonString"), [unregister]);

	return (
		<div data-testid="VerifyMessage__json" className="mt-4">
			<FormField name="jsonString">
				<FormLabel
					textClassName="text-sm leading-[17px] sm:text-base sm:leading-5"
					label={t("MESSAGE.PAGE_VERIFY_MESSAGE.FORM_STEP.JSON_STRING")}
				/>
				<TextArea
					data-testid="VerifyMessage__json-jsonString"
					className="py-4"
					initialHeight={90}
					rows={5}
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
		<div data-testid="VerifyMessage__manual" className="mt-4 space-y-4">
			<FormField name="signatory">
				<FormLabel
					textClassName="text-sm leading-[17px] sm:text-base sm:leading-5"
					label={t("COMMON.SIGNATORY")}
				/>
				<InputDefault data-testid="VerifyMessage__manual-signatory" ref={register(verifyMessage.signatory())} />
			</FormField>

			<FormField name="message">
				<FormLabel
					textClassName="text-sm leading-[17px] sm:text-base sm:leading-5"
					label={t("COMMON.MESSAGE")}
				/>
				<InputDefault data-testid="VerifyMessage__manual-message" ref={register(verifyMessage.message())} />
			</FormField>

			<FormField name="signature">
				<FormLabel
					textClassName="text-sm leading-[17px] sm:text-base sm:leading-5"
					label={t("COMMON.SIGNATURE")}
				/>
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
			<div className="flex flex-col overflow-hidden rounded-sm border border-theme-secondary-300 dim:border-theme-dim-700 dark:border-theme-dark-700 sm:rounded-xl">
				<div className="flex flex-row justify-between p-4">
					<span className="text-sm font-semibold text-theme-secondary-700 dim:text-theme-dim-700 dark:text-theme-secondary-700 sm:hidden">
						{t("MESSAGE.PAGE_VERIFY_MESSAGE.FORM_STEP.VERIFICATION_METHOD.TITLE")}:
					</span>

					<span className="hidden text-base font-semibold text-theme-secondary-900 dim:text-theme-dim-50 dark:text-theme-dark-50 sm:block">
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
				<div className="hidden bg-theme-secondary-100 px-4 pb-3 pt-3 dim:bg-theme-dim-950 dark:bg-black sm:block">
					<span className="text-sm font-normal text-theme-secondary-text dim:text-theme-dim-200">
						{t("MESSAGE.PAGE_VERIFY_MESSAGE.FORM_STEP.VERIFICATION_METHOD.DESCRIPTION")}
					</span>
				</div>
			</div>

			{method === VerificationMethod.Json ? <JsonForm /> : <ManualForm />}
		</section>
	);
};
