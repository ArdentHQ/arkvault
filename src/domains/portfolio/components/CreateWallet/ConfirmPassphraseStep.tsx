import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { MnemonicVerification } from "@/domains/wallet/components/MnemonicVerification";
import { Checkbox } from "@/app/components/Checkbox";
import { Toggle } from "@/app/components/Toggle";

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

	const handleToggleEncryption = (event: React.ChangeEvent<HTMLInputElement>) => {
		setValue("useEncryption", event.target.checked);
	};

	return (
		<section data-testid="CreateWallet__ConfirmPassphraseStep" className="space-y-4">
			<div className="rounded-lg border border-theme-secondary-300 transition-all dark:border-theme-dark-700">
				<div className="flex flex-1 items-center justify-between space-x-5 px-4 py-4 sm:px-6">
					<MnemonicVerification mnemonic={mnemonic} handleComplete={handleComplete} />
				</div>

				<div className="rounded-b-lg bg-theme-secondary-100 p-4 dark:bg-theme-dark-950 sm:p-6">
					<label className="inline-flex cursor-pointer items-start space-x-3 text-sm leading-[17px] text-theme-secondary-900 dark:text-theme-dark-100">
						<Checkbox
							data-testid="CreateWallet__ConfirmPassphraseStep__passphraseDisclaimer"
							checked={passphraseDisclaimer}
							className="mt-1 sm:mt-0.5"
							onChange={(event) => setValue("passphraseDisclaimer", event.target.checked)}
						/>

						<span>
							{t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_CONFIRMATION_STEP.PASSPHRASE_DISCLAIMER")}
						</span>
					</label>
				</div>
			</div>

			<div className="rounded-lg border border-theme-secondary-300 transition-all dark:border-theme-dark-700">
				<div className="flex flex-1 items-center justify-between space-x-5 px-4 py-4 sm:px-6">
					<span className="font-semibold leading-[17px] text-theme-secondary-900 dark:text-theme-dark-50 sm:leading-5">
						{t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_STEP.ENCRYPTION.TITLE")}
					</span>

					<span data-testid="CreateWallet__encryption">
						<Toggle
							data-testid="CreateWallet__encryption-toggle"
							defaultChecked={getValues("useEncryption")}
							onChange={handleToggleEncryption}
						/>
					</span>
				</div>

				<div className="rounded-b-lg bg-theme-secondary-100 px-4 pb-4 pt-3 dark:bg-theme-dark-950 sm:px-6">
					<span className="text-sm text-theme-secondary-700 dark:text-theme-dark-200">
						{t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_STEP.ENCRYPTION.DESCRIPTION")}
					</span>
				</div>
			</div>
		</section>
	);
};
