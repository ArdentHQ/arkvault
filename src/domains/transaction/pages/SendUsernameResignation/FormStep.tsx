import { Contracts as ProfilesContracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";
import { FormField, FormLabel } from "@/app/components/Form";
import {
	TransactionDetail,
	TransactionNetwork,
	TransactionSender,
} from "@/domains/transaction/components/TransactionDetail";

import { FeeField } from "@/domains/transaction/components/FeeField";
import { StepHeader } from "@/app/components/StepHeader";

interface FormStepProperties {
	senderWallet: ProfilesContracts.IReadWriteWallet;
	profile: ProfilesContracts.IProfile;
}

export const FormStep = ({ senderWallet, profile }: FormStepProperties) => {
	const { t } = useTranslation();

	return (
		<section data-testid="SendUsernameResignation__form-step">
			<StepHeader
				title={t("TRANSACTION.PAGE_USERNAME_RESIGNATION.FORM_STEP.TITLE")}
				subtitle={t("TRANSACTION.PAGE_USERNAME_RESIGNATION.FORM_STEP.DESCRIPTION")}
			/>

			<TransactionNetwork network={senderWallet.network()} border={false} />

			<TransactionSender address={senderWallet.address()} network={senderWallet.network()} />

			<TransactionDetail label={t("TRANSACTION.USERNAME")} borderPosition="both">
				{senderWallet.username()}
			</TransactionDetail>

			<div className="pt-6">
				<FormField name="fee">
					<FormLabel>{t("TRANSACTION.TRANSACTION_FEE")}</FormLabel>
					<FeeField
						type="usernameResignation"
						data={undefined}
						network={senderWallet.network()}
						profile={profile}
					/>
				</FormField>
			</div>
		</section>
	);
};
