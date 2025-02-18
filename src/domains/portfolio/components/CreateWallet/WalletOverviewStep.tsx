import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";

import { Alert } from "@/app/components/Alert";
import { Toggle } from "@/app/components/Toggle";
import { toasts } from "@/app/services";
import { MnemonicList, MnemonicListSkeleton } from "@/domains/wallet/components/MnemonicList";
import { useFiles } from "@/app/hooks/use-files";
import { CopyOrDownload } from "@/app/components/CopyOrDownload";
import { Divider } from "@/app/components/Divider";
import { Icon } from "@/app/components/Icon";
import cn from "classnames";

export const WalletOverviewStep = ({ isGeneratingWallet }: { isGeneratingWallet: boolean }) => {
	const { getValues, setValue, unregister, watch } = useFormContext();

	const { wallet, mnemonic } = watch();

	const [encryptionTextVisible, setEncryptionTextVisible] = React.useState(false);

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
			<div className="space-y-4">
				<Alert>{t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_STEP.WARNING")}</Alert>

				<div className="p-4 sm:p-6 pb-0 sm:pb-0 border space-y-4 sm:space-y-6 rounded-lg border-theme-secondary-300 dark:border-theme-dark-700">

					{isGeneratingWallet ? <MnemonicListSkeleton /> : <MnemonicList mnemonic={mnemonic} />}

					<CopyOrDownload
						title={t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_STEP.COPY_OR_DOWNLOAD.TITLE")}
						description={t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_STEP.COPY_OR_DOWNLOAD.DESCRIPTION")}
						copyData={mnemonic}
						onClickDownload={() => handleDownload()}
						disabled={isGeneratingWallet}
					/>

				</div>

				<div className="transition-all border border-theme-secondary-300 dark:border-theme-dark-700 rounded-lg">
					<div tabIndex={0} onClick={() => setEncryptionTextVisible(!encryptionTextVisible)} className="px-6 py-4 flex items-center space-x-4">
						<div className="flex flex-1 items-center justify-between space-x-5">
							<span className="font-semibold text-theme-secondary-900 dark:text-theme-dark-50">
								{t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_STEP.ENCRYPTION.TITLE")}
							</span>

							<span data-testid="CreateWallet__encryption">
								<Toggle
									data-testid="CreateWallet__encryption-toggle"
									defaultChecked={getValues("useEncryption")}
									onChange={handleToggleEncryption}
									disabled={isGeneratingWallet}
								/>
							</span>
						</div>
						<Divider type="vertical" />
						<div className="text-theme-secondary-700 dark:text-theme-dark-200 rounded p-2 hover:bg-theme-navy-200 dark:hover:text-theme-primary-700 dark:hover:bg-theme-secondary-800 dark:hover:text-white">
							<Icon
								name="ChevronDownSmall"
								className={cn("transition-transform", { "rotate-180": encryptionTextVisible})}
								size="sm"
							/>
						</div>
					</div>

					{encryptionTextVisible && <div className="px-6 pt-3 pb-4 bg-theme-secondary-100 dark:bg-theme-dark-950 rounded-b-lg">
						<span className="text-sm text-theme-secondary-700 dark:text-theme-dark-200">
							{t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_STEP.ENCRYPTION.DESCRIPTION")}
						</span>
					</div> }
				</div>
			</div>
		</section>
	);
};
