import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";

import { Alert } from "@/app/components/Alert";
import { toasts } from "@/app/services";
import { MnemonicList, MnemonicListSkeleton } from "@/domains/wallet/components/MnemonicList";
import { useFiles } from "@/app/hooks/use-files";
import { CopyOrDownload } from "@/app/components/CopyOrDownload";

export const WalletOverviewStep = ({ isGeneratingWallet, mnemonic }: { isGeneratingWallet: boolean, mnemonic?: string }) => {
	const { unregister, watch } = useFormContext();

	const { wallet } = watch();

	const { isLegacy, showSaveDialog } = useFiles();

	const { t } = useTranslation();

	useEffect(() => {
		unregister("verification");
	}, [unregister]);

	const handleDownload = async (mnemonic: string) => {
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

	return (
		<section data-testid="CreateWallet__WalletOverviewStep">
			<Alert>{t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_STEP.WARNING")}</Alert>

			{mnemonic && (
				<div className="border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 mt-4 space-y-4 rounded-lg border p-4 pb-0 sm:space-y-6 sm:p-6 sm:pb-0">
					{isGeneratingWallet ? <MnemonicListSkeleton /> : <MnemonicList mnemonic={mnemonic} />}

					<CopyOrDownload
						title={t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_STEP.COPY_OR_DOWNLOAD.TITLE")}
						description={t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_STEP.COPY_OR_DOWNLOAD.DESCRIPTION")}
						copyData={mnemonic}
						onClickDownload={() => handleDownload(mnemonic)}
						disabled={isGeneratingWallet}
					/>
				</div>
			)}
		</section>
	);
};
