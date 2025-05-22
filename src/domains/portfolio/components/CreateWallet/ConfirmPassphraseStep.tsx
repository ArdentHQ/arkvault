import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { MnemonicVerification } from "@/domains/wallet/components/MnemonicVerification";
import { Checkbox } from "@/app/components/Checkbox";
import { WalletEncryptionBanner } from "@/domains/wallet/components/WalletEncryptionBanner.tsx";

export const ConfirmPassphraseStep = () => {
	const { getValues, setValue, watch, clearErrors, register } = useFormContext();
	const [mnemonicValidated, setMnemonicValidated] = useState(false);
	const passphraseDisclaimer: boolean = getValues("passphraseDisclaimer");
	const mnemonic = watch("mnemonic");

	const { t } = useTranslation();

	const useEncryption = watch("useEncryption");
	const acceptResponsibility = watch("acceptResponsibility");

	const handleComplete = (isComplete: boolean) => {
		setMnemonicValidated(isComplete);
	};

	useEffect(() => {
		register("verification", { required: true });
		clearErrors(["validation", "confirmEncryptionPassword"]);
		setValue("passphraseDisclaimer", false);
	}, []);

	useEffect(() => {
		setValue("verification", passphraseDisclaimer && mnemonicValidated, {
			shouldDirty: true,
			shouldValidate: true,
		});
	}, [mnemonicValidated, passphraseDisclaimer]);

	const handleToggleEncryption = (event: React.ChangeEvent<HTMLInputElement>) => {
		setValue("useEncryption", event.target.checked);
	};

	const handleToggleResponsibility = (event: React.ChangeEvent<HTMLInputElement>) => {
		setValue("acceptResponsibility", event.target.checked);
	};

	return (
		<section data-testid="CreateWallet__ConfirmPassphraseStep" className="space-y-4">
			<div className="rounded-lg border transition-all border-theme-secondary-300 dark:border-theme-dark-700">
				<div className="flex flex-1 justify-between items-center py-4 px-4 space-x-5 sm:px-6">
					<MnemonicVerification mnemonic={mnemonic} handleComplete={handleComplete} />
				</div>

				<div className="p-4 rounded-b-lg sm:p-6 bg-theme-secondary-100 dark:bg-theme-dark-950">
					<label className="inline-flex items-start space-x-3 text-sm cursor-pointer text-theme-secondary-900 leading-[17px] dark:text-theme-dark-100">
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

			<WalletEncryptionBanner
				toggleChecked={useEncryption}
				toggleOnChange={handleToggleEncryption}
				checkboxChecked={acceptResponsibility}
				checkboxOnChange={handleToggleResponsibility}
			/>
		</section>
	);
};
