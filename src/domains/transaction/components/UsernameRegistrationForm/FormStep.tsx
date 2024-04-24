import React, { ChangeEvent, useEffect, useMemo, useRef } from "react";
import { FieldError, useFormContext } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { FormField, FormLabel } from "@/app/components/Form";
import { TransactionNetwork, TransactionSender } from "@/domains/transaction/components/TransactionDetail";

import { Alert } from "@/app/components/Alert";
import { FeeField } from "@/domains/transaction/components/FeeField";
import { FormStepProperties } from "@/domains/transaction/pages/SendRegistration/SendRegistration.contracts";
import { InputDefault } from "@/app/components/Input";
import { StepHeader } from "@/app/components/StepHeader";
import { useValidation } from "@/app/hooks";

export const FormStep: React.FC<FormStepProperties> = ({ wallet, profile }: FormStepProperties) => {
	const { t } = useTranslation();

	const { usernameRegistration } = useValidation();

	const { getValues, register, setValue, errors } = useFormContext();
	const username = getValues("username");

	const previousUsername = wallet.username();

	const network = useMemo(() => wallet.network(), [wallet]);
	const feeTransactionData = useMemo(() => ({ username }), [username]);

	const userExistsController = useRef<AbortController | undefined>(undefined);

	useEffect(() => {
		if (!username) {
			register("username", usernameRegistration.username(network, userExistsController));
		}
	}, [usernameRegistration, register, network, username]);

	const hasUsernameErrors = "username" in errors;

	useEffect(() => {
		if (hasUsernameErrors) {
			userExistsController.current?.abort();
		}
	}, [hasUsernameErrors]);

	return (
		<section data-testid="UsernameRegistrationForm__form-step">
			<StepHeader
				title={t("TRANSACTION.PAGE_USERNAME_REGISTRATION.FORM_STEP.TITLE")}
				subtitle={t("TRANSACTION.PAGE_USERNAME_REGISTRATION.FORM_STEP.DESCRIPTION")}
			/>

			{previousUsername ? (
				<Alert variant="warning" className="mt-6">
					<Trans
						i18nKey="TRANSACTION.PAGE_USERNAME_REGISTRATION.FORM_STEP.USERNAME_REGISTERED"
						values={{ username: previousUsername }}
					/>
				</Alert>
			) : (
				<Alert variant="info" className="mt-6">
					{t("TRANSACTION.PAGE_USERNAME_REGISTRATION.FORM_STEP.INFO")}
				</Alert>
			)}

			<TransactionNetwork network={wallet.network()} border={false} />

			<TransactionSender address={wallet.address()} network={wallet.network()} borderPosition="both" />

			<div className="space-y-6 pt-6">
				<FormField name="username">
					<FormLabel label={previousUsername ? t("TRANSACTION.NEW_USERNAME") : t("TRANSACTION.USERNAME")} />
					<InputDefault
						data-testid="Input__username"
						defaultValue={username}
						onChange={(event: ChangeEvent<HTMLInputElement>) => {
							userExistsController.current?.abort();
							userExistsController.current = new AbortController();
							setValue("username", event.target.value, { shouldDirty: true, shouldValidate: true });
						}}
					/>
				</FormField>

				<FormField name="fee">
					<FormLabel label={t("TRANSACTION.TRANSACTION_FEE")} />
					<FeeField
						type="usernameRegistration"
						data={feeTransactionData}
						network={network}
						profile={profile}
					/>
				</FormField>
			</div>
		</section>
	);
};
