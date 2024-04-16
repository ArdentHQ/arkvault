import React, { ChangeEvent, useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
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

	const { getValues, register, setValue } = useFormContext();
	const username = getValues("username");

	const network = useMemo(() => wallet.network(), [wallet]);
	const feeTransactionData = useMemo(() => ({ username }), [username]);

	useEffect(() => {
		if (!username) {
			register("username", usernameRegistration.username(network));
		}
	}, [usernameRegistration, register, network, username]);

	return (
		<section data-testid="UsernameRegistrationForm__form-step">
			<StepHeader
				title={t("TRANSACTION.PAGE_USERNAME_REGISTRATION.FORM_STEP.TITLE")}
				subtitle={t("TRANSACTION.PAGE_USERNAME_REGISTRATION.FORM_STEP.DESCRIPTION")}
			/>

			<Alert variant="info" className="mt-6">
				{t("TRANSACTION.PAGE_USERNAME_REGISTRATION.FORM_STEP.INFO")}
			</Alert>

			<TransactionNetwork network={wallet.network()} border={false} />

			<TransactionSender address={wallet.address()} network={wallet.network()} borderPosition="both" />

			<div className="space-y-6 pt-6">
				<FormField name="username">
					<FormLabel label={t("TRANSACTION.USERNAME")} />
					<InputDefault
						data-testid="Input__username"
						defaultValue={username}
						onChange={(event: ChangeEvent<HTMLInputElement>) =>
							setValue("username", event.target.value, { shouldDirty: true, shouldValidate: true })
						}
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
