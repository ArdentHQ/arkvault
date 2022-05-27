import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";

import { Alert } from "@/app/components/Alert";
import { Header } from "@/app/components/Header";
import { Toggle } from "@/app/components/Toggle";
import { toasts } from "@/app/services";
import { MnemonicList } from "@/domains/wallet/components/MnemonicList";
import { useFiles } from "@/app/hooks/use-files";
import { CopyOrDownload } from "@/app/components/CopyOrDownload";

export const WalletOverviewStep = () => {
	const { getValues, setValue, unregister, watch } = useFormContext();

	// getValues does not get the value of `defaultValues` on first render
	const [defaultMnemonic] = useState(() => watch("mnemonic"));
	const mnemonic = getValues("mnemonic") || defaultMnemonic;

	const [defaultWallet] = useState(() => watch("wallet"));
	const wallet = getValues("wallet") || defaultWallet;
	const { isLegacy, showSaveDialog } = useFiles();

	const { t } = useTranslation();

	useEffect(() => {
		unregister("verification");
	}, [unregister]);

	const handleDownload = async () => {
		try {
			const filePath = await showSaveDialog(mnemonic, { fileName: `${wallet.address()}.txt` });

			if (!isLegacy()) {
				toasts.success(<Trans i18nKey="COMMON.SAVE_FILE.SUCCESS" values={{ filePath }} />);
			}
		} catch (error) {
			if (!error.message.includes("The user aborted a request")) {
				toasts.error(t("COMMON.SAVE_FILE.ERROR", { error: error.message }));
			}
		}
	};

	const handleToggleEncryption = (event: React.ChangeEvent<HTMLInputElement>) => {
		setValue("useEncryption", event.target.checked);
	};

	return (
		<section data-testid="CreateWallet__WalletOverviewStep">
			<Header title={t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_STEP.TITLE")} className="hidden sm:block" />

			<Alert className="mt-6">{t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_STEP.WARNING")}</Alert>

			<div className="mt-8 space-y-8">
				<MnemonicList mnemonic={mnemonic} />

				<CopyOrDownload
					title={t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_STEP.COPY_OR_DOWNLOAD.TITLE")}
					description={t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_STEP.COPY_OR_DOWNLOAD.DESCRIPTION")}
					copyData={mnemonic}
					onClickDownload={() => handleDownload()}
				/>

				<div className="flex w-full flex-col space-y-2">
					<div className="flex items-center justify-between space-x-5">
						<span className="font-bold text-theme-secondary-text">
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

					<span className="mr-12 text-sm text-theme-secondary-500">
						{t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_STEP.ENCRYPTION.DESCRIPTION")}
					</span>
				</div>
			</div>
		</section>
	);
};
