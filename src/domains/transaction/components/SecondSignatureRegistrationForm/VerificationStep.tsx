import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { MnemonicVerification } from "@/domains/wallet/components/MnemonicVerification";
import { StepHeader } from "@/app/components/StepHeader";
import { Divider } from "@/app/components/Divider";
import { Checkbox } from "@/app/components/Checkbox";
import { Icon } from "@/app/components/Icon";

export const VerificationStep = () => {
	const { getValues, register, setValue, watch } = useFormContext();

	// getValues does not get the value of `defaultValues` on first render
	const [defaultMnemonic] = useState(() => watch("secondMnemonic"));
	const mnemonic = getValues("secondMnemonic") || defaultMnemonic;

	const [mnemonicValidated, setMnemonicValidated] = useState(false);
	const [passphraseDisclaimer, setPassphraseDisclaimer] = useState(false);

	const { t } = useTranslation();

	const handleComplete = (isComplete: boolean) => {
		setMnemonicValidated(isComplete);
	};

	useEffect(() => {
		setValue("verification", passphraseDisclaimer && mnemonicValidated, {
			shouldDirty: true,
			shouldValidate: true,
		});
	}, [mnemonicValidated, passphraseDisclaimer]);

	useEffect(() => {
		register("verification", { required: true });
	}, [register]);

	useEffect(() => {
		const m = mnemonic.split(" ");

		for (const [index, element] of m.entries()) {
			console.log(index + 1, element);
		}
	}, [mnemonic]);
	return (
		<section data-testid="SecondSignatureRegistrationForm__verification-step">
			<StepHeader
				title={t("TRANSACTION.PAGE_SECOND_SIGNATURE.PASSPHRASE_CONFIRMATION_STEP.TITLE")}
				titleIcon={<Icon name="ConfirmYourPassphrase" dimensions={[24, 24]} className="text-theme-navy-600" />}
				subtitle={t("TRANSACTION.PAGE_SECOND_SIGNATURE.PASSPHRASE_CONFIRMATION_STEP.SUBTITLE")}
			/>

			<div className="mt-6 sm:mt-4">
				<MnemonicVerification mnemonic={mnemonic} handleComplete={handleComplete} />

				<Divider />

				<label className="inline-flex cursor-pointer items-center space-x-3 text-theme-secondary-text">
					<Checkbox
						data-testid="CreateWallet__ConfirmPassphraseStep__passphraseDisclaimer"
						checked={passphraseDisclaimer}
						onChange={(event) => setPassphraseDisclaimer(event.target.checked)}
					/>

					<span>{t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_CONFIRMATION_STEP.PASSPHRASE_DISCLAIMER")}</span>
				</label>
			</div>
		</section>
	);
};
