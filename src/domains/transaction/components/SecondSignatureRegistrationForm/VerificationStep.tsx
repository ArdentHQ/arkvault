import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { MnemonicVerification } from "@/domains/wallet/components/MnemonicVerification";
import { StepHeader } from "@/app/components/StepHeader";

export const VerificationStep = () => {
	const { getValues, register, setValue, watch } = useFormContext();

	// getValues does not get the value of `defaultValues` on first render
	const [defaultMnemonic] = useState(() => watch("secondMnemonic"));
	const mnemonic = getValues("secondMnemonic") || defaultMnemonic;

	const { t } = useTranslation();

	const handleComplete = (isComplete: boolean) => {
		setValue("verification", isComplete, { shouldDirty: true, shouldValidate: true });
	};

	useEffect(() => {
		register("verification", { required: true });
	}, [register]);

	return (
		<section data-testid="SecondSignatureRegistrationForm__verification-step" className="space-y-6">
			<StepHeader
				title={t("TRANSACTION.PAGE_SECOND_SIGNATURE.PASSPHRASE_CONFIRMATION_STEP.TITLE")}
				subtitle={t("TRANSACTION.PAGE_SECOND_SIGNATURE.PASSPHRASE_CONFIRMATION_STEP.SUBTITLE")}
			/>

			<MnemonicVerification mnemonic={mnemonic} handleComplete={handleComplete} />
		</section>
	);
};
