import { Contracts } from "@ardenthq/sdk-profiles";
import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Alert } from "@/app/components/Alert";
import { FormField, FormLabel } from "@/app/components/Form";
import { InputDefault } from "@/app/components/Input";
import { StepHeader } from "@/app/components/StepHeader";
import { useEnvironmentContext } from "@/app/contexts";
import { useValidation } from "@/app/hooks";
import { FeeField } from "@/domains/transaction/components/FeeField";
import { TransactionNetwork, TransactionSender } from "@/domains/transaction/components/TransactionDetail";
import { FormStepProperties } from "@/domains/transaction/pages/SendRegistration/SendRegistration.contracts";

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
				title={t("TRANSACTION.PAGE_DELEGATE_REGISTRATION.FORM_STEP.TITLE")}
				subtitle={t("TRANSACTION.PAGE_DELEGATE_REGISTRATION.FORM_STEP.DESCRIPTION")}
			/>

			<Alert className="mt-6">{t("TRANSACTION.PAGE_DELEGATE_REGISTRATION.FORM_STEP.WARNING")}</Alert>

			<TransactionNetwork network={wallet.network()} border={false} />

			<TransactionSender address={wallet.address()} network={wallet.network()} borderPosition="both" />

			<div className="space-y-6 pt-6">
				<FormField name="username">
					<FormLabel label={t("TRANSACTION.DELEGATE_NAME")} />
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
