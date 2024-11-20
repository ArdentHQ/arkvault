import { Contracts } from "@ardenthq/sdk-profiles";
import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Alert } from "@/app/components/Alert";
import { FormField, FormLabel } from "@/app/components/Form";
import { InputDefault } from "@/app/components/Input";
import { useEnvironmentContext } from "@/app/contexts";
import { useValidation } from "@/app/hooks";
import { FeeField } from "@/domains/transaction/components/FeeField";
import { TransactionAddresses } from "@/domains/transaction/components/TransactionDetail";
import { FormStepProperties } from "@/domains/transaction/pages/SendRegistration/SendRegistration.contracts";
import { StepHeader } from "@/app/components/StepHeader";
import { ThemeIcon } from "@/app/components/Icon";

export const FormStep: React.FC<FormStepProperties> = ({ wallet, profile }: FormStepProperties) => {
	const { t } = useTranslation();
	const { env } = useEnvironmentContext();

	const { delegateRegistration } = useValidation();

	const { getValues, register, setValue } = useFormContext();
	const username = getValues("username");
	const [usernames, setUsernames] = useState<string[]>([]);

	const network = useMemo(() => wallet.network(), [wallet]);
	const feeTransactionData = useMemo(() => ({ username }), [username]);

	useEffect(() => {
		setUsernames(
			env
				.delegates()
				.all(wallet.coinId(), wallet.networkId())
				.map((delegate: Contracts.IReadOnlyWallet) => delegate.username()!),
		);
	}, [env, wallet]);

	useEffect(() => {
		if (!username) {
			register("username", delegateRegistration.username(usernames));
		}
	}, [delegateRegistration, usernames, register, username]);

	return (
		<section data-testid="DelegateRegistrationForm__form-step">
			<StepHeader
				title={t("TRANSACTION.PAGE_VALIDATOR_REGISTRATION.FORM_STEP.TITLE")}
				subtitle={t("TRANSACTION.PAGE_VALIDATOR_REGISTRATION.FORM_STEP.DESCRIPTION")}
				titleIcon={
					<ThemeIcon
						dimensions={[24, 24]}
						lightIcon="SendTransactionLight"
						darkIcon="SendTransactionDark"
						greenDarkIcon="SendTransactionDarkGreen"
						greenLightIcon="SendTransactionLightGreen"
					/>
				}
			/>

			<Alert className="mt-6 sm:mt-4">{t("TRANSACTION.PAGE_VALIDATOR_REGISTRATION.FORM_STEP.WARNING")}</Alert>

			<div className="-mx-3 mt-6 sm:mx-0 sm:mt-4">
				<TransactionAddresses senderAddress={wallet.address()} profile={profile} network={wallet.network()} />
			</div>

			<div className="mt-3 space-y-4 sm:mt-4">
				<FormField name="username">
					<FormLabel label={t("TRANSACTION.VALIDATOR_NAME")} />
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
						type="delegateRegistration"
						data={feeTransactionData}
						network={network}
						profile={profile}
					/>
				</FormField>
			</div>
		</section>
	);
};
