import { BIP39 } from "@payvo/sdk-cryptography";
import { Contracts } from "@payvo/sdk-profiles";
import React, { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Alert } from "@/app/components/Alert";
import { FormField, FormLabel } from "@/app/components/Form";
import { useValidation } from "@/app/hooks";
import { FeeField } from "@/domains/transaction/components/FeeField";
import { TransactionSender } from "@/domains/transaction/components/TransactionDetail";
import { FormStepProperties } from "@/domains/transaction/pages/SendRegistration/SendRegistration.contracts";
import { StepHeader } from "@/app/components/StepHeader";

export const GenerationStep = ({ wallet, profile }: FormStepProperties) => {
	const { t } = useTranslation();

	const { common } = useValidation();
	const { setValue, register, watch } = useFormContext();

	const secondMnemonic = watch("secondMnemonic");

	const network = useMemo(() => wallet.network(), [wallet]);
	const feeTransactionData = useMemo(() => ({ mnemonic: secondMnemonic }), [secondMnemonic]);

	useEffect(() => {
		register("secondMnemonic");
		register("wallet");
	}, [register, common, wallet]);

	useEffect(() => {
		if (secondMnemonic) {
			return;
		}

		const newMnemonic = BIP39.generate(
			profile.settings().get<string>(Contracts.ProfileSetting.Bip39Locale, "english"),
			wallet.network().wordCount(),
		);

		setValue("secondMnemonic", newMnemonic);
		setValue("wallet", wallet);
	}, [profile, setValue, wallet, secondMnemonic]);

	return (
		<section data-testid="SecondSignatureRegistrationForm__generation-step">
			<StepHeader
				title={t("TRANSACTION.PAGE_SECOND_SIGNATURE.GENERATION_STEP.TITLE")}
				subtitle={t("TRANSACTION.PAGE_SECOND_SIGNATURE.GENERATION_STEP.DESCRIPTION")}
			/>

			<Alert className="mt-6">{t("TRANSACTION.PAGE_SECOND_SIGNATURE.GENERATION_STEP.WARNING")}</Alert>

			<TransactionSender address={wallet.address()} network={wallet.network()} borderPosition="bottom" />

			<div className="pt-6">
				<FormField name="fee">
					<FormLabel label={t("TRANSACTION.TRANSACTION_FEE")} />
					<FeeField type="secondSignature" data={feeTransactionData} network={network} profile={profile} />
				</FormField>
			</div>
		</section>
	);
};
