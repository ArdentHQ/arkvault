import { Contracts as ProfilesContracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { Alert } from "@/app/components/Alert";
import { FormField, FormLabel } from "@/app/components/Form";
import { FeeField } from "@/domains/transaction/components/FeeField";
import {
	TransactionDetail,
	TransactionNetwork,
	TransactionSender,
} from "@/domains/transaction/components/TransactionDetail";
import { StepHeader } from "@/app/components/StepHeader";
import { selectDelegateValidatorTranslation } from "@/domains/wallet/utils/selectDelegateValidatorTranslation";

interface FormStepProperties {
	senderWallet: ProfilesContracts.IReadWriteWallet;
	profile: ProfilesContracts.IProfile;
}

export const FormStep = ({ senderWallet, profile }: FormStepProperties) => {
	const { t } = useTranslation();

	return (
		<section data-testid="SendDelegateResignation__form-step">
			<StepHeader
				title={selectDelegateValidatorTranslation({
					delegateStr: t("TRANSACTION.PAGE_DELEGATE_RESIGNATION.FORM_STEP.TITLE"),
					network: senderWallet.network(),
					validatorStr: t("TRANSACTION.PAGE_VALIDATOR_RESIGNATION.FORM_STEP.TITLE"),
				})}
				subtitle={selectDelegateValidatorTranslation({
					delegateStr: t("TRANSACTION.PAGE_DELEGATE_RESIGNATION.FORM_STEP.DESCRIPTION"),
					network: senderWallet.network(),
					validatorStr: t("TRANSACTION.PAGE_VALIDATOR_RESIGNATION.FORM_STEP.DESCRIPTION"),
				})}
			/>

			<Alert className="mt-6">{t("TRANSACTION.PAGE_DELEGATE_RESIGNATION.FORM_STEP.WARNING")}</Alert>

			<TransactionNetwork network={senderWallet.network()} border={false} />

			<TransactionSender address={senderWallet.address()} network={senderWallet.network()} />

			{
				senderWallet.username() && (<TransactionDetail label={selectDelegateValidatorTranslation({
				delegateStr: t("TRANSACTION.DELEGATE_NAME"),
				network: senderWallet.network(),
				validatorStr: t("TRANSACTION.VALIDATOR_NAME"),
			})} borderPosition="both">
				{senderWallet.username()}
			</TransactionDetail>)
			}


			<div className="pt-6">
				<FormField name="fee">
					<FormLabel>{t("TRANSACTION.TRANSACTION_FEE")}</FormLabel>
					<FeeField
						type="delegateResignation"
						data={undefined}
						network={senderWallet.network()}
						profile={profile}
					/>
				</FormField>
			</div>
		</section>
	);
};
