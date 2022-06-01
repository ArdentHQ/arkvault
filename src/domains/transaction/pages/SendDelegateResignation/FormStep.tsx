import { Contracts as ProfilesContracts } from "@payvo/sdk-profiles";
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

interface FormStepProperties {
	senderWallet: ProfilesContracts.IReadWriteWallet;
	profile: ProfilesContracts.IProfile;
}

export const FormStep = ({ senderWallet, profile }: FormStepProperties) => {
	const { t } = useTranslation();

	return (
		<section data-testid="SendDelegateResignation__form-step">
			<StepHeader
				title={t("TRANSACTION.PAGE_DELEGATE_RESIGNATION.FORM_STEP.TITLE")}
				subtitle={t("TRANSACTION.PAGE_DELEGATE_RESIGNATION.FORM_STEP.DESCRIPTION")}
			/>

			<Alert className="mt-6">{t("TRANSACTION.PAGE_DELEGATE_RESIGNATION.FORM_STEP.WARNING")}</Alert>

			<TransactionNetwork network={senderWallet.network()} border={false} />

			<TransactionSender address={senderWallet.address()} network={senderWallet.network()} />

			<TransactionDetail label={t("TRANSACTION.DELEGATE_NAME")} borderPosition="both">
				{senderWallet.username()}
			</TransactionDetail>

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
