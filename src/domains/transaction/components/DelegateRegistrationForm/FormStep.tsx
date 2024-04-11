import { FormField, FormLabel } from "@/app/components/Form";
import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import { TransactionNetwork, TransactionSender } from "@/domains/transaction/components/TransactionDetail";

import { Alert } from "@/app/components/Alert";
import { Contracts } from "@ardenthq/sdk-profiles";
import { FeeField } from "@/domains/transaction/components/FeeField";
import { FormStepProperties } from "@/domains/transaction/pages/SendRegistration/SendRegistration.contracts";
import { InputDefault } from "@/app/components/Input";
import { StepHeader } from "@/app/components/StepHeader";
import { isMainsailNetwork } from "@/utils/network-utils";
import { useEnvironmentContext } from "@/app/contexts";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useValidation } from "@/app/hooks";
import { selectDelegateValidatorTranslation } from "@/domains/wallet/utils/selectDelegateValidatorTranslation";

export const FormStep: React.FC<FormStepProperties> = ({ wallet, profile }: FormStepProperties) => {
	const { t } = useTranslation();
	const { env } = useEnvironmentContext();

	const { delegateRegistration, validatorRegistration } = useValidation({ network: wallet.network() });

	const { register, setValue, getValues } = useFormContext();
	const { username, publicKey } = getValues(["username", "publicKey"]);
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

	if (!isMainsailNetwork(network)) {
		useEffect(() => {
			if (!username) {
				register("username", delegateRegistration.username(usernames));
			}
		}, [delegateRegistration, usernames, register, username]);
	}

	return (
		<section data-testid="DelegateRegistrationForm__form-step">
			<StepHeader
				title={selectDelegateValidatorTranslation({
					delegateStr: t("TRANSACTION.PAGE_DELEGATE_REGISTRATION.FORM_STEP.TITLE"),
					network: network,
					validatorStr: t("TRANSACTION.PAGE_VALIDATOR_REGISTRATION.FORM_STEP.TITLE"),
				})}
				subtitle={selectDelegateValidatorTranslation({
					delegateStr: t("TRANSACTION.PAGE_DELEGATE_REGISTRATION.FORM_STEP.DESCRIPTION"),
					network: network,
					validatorStr: t("TRANSACTION.PAGE_VALIDATOR_REGISTRATION.FORM_STEP.DESCRIPTION"),
				})}
			/>

			{!isMainsailNetwork(network) && (
				<Alert className="mt-6">{t("TRANSACTION.PAGE_DELEGATE_REGISTRATION.FORM_STEP.WARNING")}</Alert>
			)}

			<TransactionNetwork network={network} border={false} />

			<TransactionSender address={wallet.address()} network={network} borderPosition="both" />

			<div className="space-y-6 pt-6">
				{!isMainsailNetwork(network) && (
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
				)}

				{isMainsailNetwork(network) && (
					<FormField name="publicKey">
						<FormLabel label={t("TRANSACTION.VALIDATOR_PUBLIC_KEY")} />
						<InputDefault
							ref={register(validatorRegistration.publicKey(wallet))}
							data-testid="Input__public_key"
							defaultValue={publicKey}
							onChange={(event: ChangeEvent<HTMLInputElement>) =>
								setValue("publicKey", event.target.value, { shouldDirty: true, shouldValidate: true })
							}
						/>
					</FormField>
				)}

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
