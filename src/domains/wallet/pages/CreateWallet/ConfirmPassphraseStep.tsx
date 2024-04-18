import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Header } from "@/app/components/Header";
import { MnemonicVerification } from "@/domains/wallet/components/MnemonicVerification";
import { Divider } from "@/app/components/Divider";
import { Checkbox } from "@/app/components/Checkbox";

export const ConfirmPassphraseStep = () => {
	const { getValues, register, setValue, watch } = useFormContext();
	const [mnemonicValidated, setMnemonicValidated] = useState(false);
	const isVerified: boolean = getValues("verification");
	const passphraseDisclaimer: boolean = getValues("passphraseDisclaimer");
	const mnemonic = watch("mnemonic");

	const { t } = useTranslation();

	const handleComplete = (isComplete: boolean) => {
		setMnemonicValidated(isComplete);
	};

	useEffect(() => {
		if (!isVerified) {
			register("verification", { required: true });
		}
	}, [isVerified, register]);

	useEffect(() => {
		setValue("verification", passphraseDisclaimer && mnemonicValidated, {
			shouldDirty: true,
			shouldValidate: true,
		});
	}, [mnemonicValidated, passphraseDisclaimer]);

	return (
		<section data-testid="CreateWallet__ConfirmPassphraseStep">
			<Header
				title={t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_CONFIRMATION_STEP.TITLE")}
				subtitle={t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_CONFIRMATION_STEP.SUBTITLE")}
				className="hidden sm:block"
			/>

			<MnemonicVerification mnemonic={mnemonic} handleComplete={handleComplete} />

			<Divider />

			<label className="inline-flex cursor-pointer items-center space-x-3 text-theme-secondary-text">
				<Checkbox
					checked={passphraseDisclaimer}
					onChange={(event) => setValue("passphraseDisclaimer", event.target.checked)}
				/>

				<span>{t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_CONFIRMATION_STEP.PASSPHRASE_DISCLAIMER")}</span>
			</label>
		</section>
	);
};
