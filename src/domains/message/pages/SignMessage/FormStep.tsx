import { Contracts } from "@ardenthq/sdk-profiles";
import React, { ChangeEvent } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Avatar } from "@/app/components/Avatar";
import { FormField, FormLabel } from "@/app/components/Form";
import { Input, InputCounter } from "@/app/components/Input";
import { StepHeader } from "@/app/components/StepHeader";

export const FormStep = ({
	wallet,
	disableMessageInput,
	maxLength,
}: {
	wallet: Contracts.IReadWriteWallet;
	disableMessageInput?: boolean;
	maxLength: number;
}) => {
	const { t } = useTranslation();

	const { setValue } = useFormContext();

	const getSubtitle = () => {
		if (wallet.isLedger()) {
			return t("MESSAGE.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_LEDGER");
		}

		if (wallet.actsWithSecret()) {
			return t("MESSAGE.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_SECRET");
		}

		return wallet.signingKey().exists()
			? t("MESSAGE.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_ENCRYPTION_PASSWORD")
			: t("MESSAGE.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_MNEMONIC");
	};

	return (
		<section className="space-y-5">
			<StepHeader title={t("MESSAGE.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE")} subtitle={getSubtitle()} />

			<FormField name="signatory-address">
				<FormLabel label={t("MESSAGE.SIGNATORY")} />
				<Input
					innerClassName="font-semibold"
					value={wallet.address()}
					addons={{
						start: {
							content: <Avatar address={wallet.address()} size="sm" noShadow />,
						},
					}}
					disabled
				/>
			</FormField>

			<FormField name="message">
				<FormLabel label={t("COMMON.MESSAGE")} />
				<InputCounter
					onChange={(event: ChangeEvent<HTMLInputElement>) =>
						setValue("message", event.target.value, {
							shouldDirty: true,
							shouldValidate: true,
						})
					}
					data-testid="SignMessage__message-input"
					readOnly={disableMessageInput}
					maxLengthLabel={maxLength.toString()}
				/>
			</FormField>
		</section>
	);
};
