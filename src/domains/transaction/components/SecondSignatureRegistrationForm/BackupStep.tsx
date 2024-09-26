/* eslint-disable @typescript-eslint/require-await */
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { Alert } from "@/app/components/Alert";
import { toasts } from "@/app/services";
import { MnemonicList } from "@/domains/wallet/components/MnemonicList";
import { useFiles } from "@/app/hooks/use-files";
import { CopyOrDownload } from "@/app/components/CopyOrDownload";
import { StepHeader } from "@/app/components/StepHeader";
import {ThemeIcon} from "@/app/components/Icon";

export const BackupStep = () => {
	const { getValues, unregister, watch } = useFormContext();

	// getValues does not get the value of `defaultValues` on first render
	const [defaultMnemonic] = useState(() => watch("secondMnemonic"));
	const mnemonic = getValues("secondMnemonic") || defaultMnemonic;

	const [defaultWallet] = useState(() => watch("wallet"));
	const wallet = getValues("wallet") || defaultWallet;
	const { isLegacy, showSaveDialog } = useFiles();

	const { t } = useTranslation();

	useEffect(() => {
		unregister("verification");
	}, [unregister]);

	const handleDownload = async () => {
		try {
			const filePath = showSaveDialog(mnemonic, { fileName: `${wallet.address()}.txt` });

			if (!isLegacy()) {
				toasts.success(<Trans i18nKey="COMMON.SAVE_FILE.SUCCESS" values={{ filePath }} />);
			}
		} catch (error) {
			if (!error.message.includes("The user aborted a request")) {
				toasts.error(t("COMMON.SAVE_FILE.ERROR", { error: error.message }));
			}
		}
	};

	return (
		<section data-testid="SecondSignatureRegistrationForm__backup-step">
			<StepHeader
				title={t("TRANSACTION.PAGE_SECOND_SIGNATURE.PASSPHRASE_STEP.TITLE")}
				titleIcon={
					<ThemeIcon darkIcon="YourPassphraseDark" lightIcon="YourPassphraseLight" dimensions={[24, 24]} />
				}
			/>

			<div className="space-y-4 sm:pt-4 pt-6">
				<Alert>{t("TRANSACTION.PAGE_SECOND_SIGNATURE.PASSPHRASE_STEP.WARNING")}</Alert>
				<MnemonicList mnemonic={mnemonic} />

				<CopyOrDownload
					title={t("TRANSACTION.PAGE_SECOND_SIGNATURE.PASSPHRASE_STEP.COPY_OR_DOWNLOAD.TITLE")}
					description={t("TRANSACTION.PAGE_SECOND_SIGNATURE.PASSPHRASE_STEP.COPY_OR_DOWNLOAD.DESCRIPTION")}
					copyData={mnemonic}
					onClickDownload={handleDownload}
				/>
			</div>
		</section>
	);
};
