import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { MnemonicVerification } from "@/domains/wallet/components/MnemonicVerification";
import { Divider } from "@/app/components/Divider";
import { Checkbox } from "@/app/components/Checkbox";

export const ConfirmPassphraseStep = () => {
	const { getValues, setValue, watch } = useFormContext();
	const [mnemonicValidated, setMnemonicValidated] = useState(false);
	const passphraseDisclaimer: boolean = getValues("passphraseDisclaimer");
	const mnemonic = watch("mnemonic");

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
		setValue("passphraseDisclaimer", false);
	}, []);

	return (
		<section data-testid="CreateWallet__ConfirmPassphraseStep">
			<MnemonicVerification mnemonic={mnemonic} handleComplete={handleComplete} />

			<Divider className="h-1 border-theme-secondary-300 dark:border-theme-secondary-800" />

			<label className="inline-flex cursor-pointer items-center space-x-3 text-sm leading-[17px] text-theme-secondary-text">
				<Checkbox
					data-testid="CreateWallet__ConfirmPassphraseStep__passphraseDisclaimer"
					checked={passphraseDisclaimer}
					className="mt-1 sm:mt-0.5"
					onChange={(event) => setValue("passphraseDisclaimer", event.target.checked)}
				/>

				<span>{t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_CONFIRMATION_STEP.PASSPHRASE_DISCLAIMER")}</span>
			</label>
		</section>
	);
};
