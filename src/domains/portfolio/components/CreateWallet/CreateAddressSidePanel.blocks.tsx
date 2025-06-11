import React from "react";
import { Icon, ThemeIcon } from "@/app/components/Icon";
import { useTranslation } from "react-i18next";

export enum CreateStep {
	WalletOverviewStep = 1,
	ConfirmPassphraseStep = 2,
	EncryptPasswordStep = 3,
	SuccessStep = 4,
}

interface StepHeaderConfig {
	title: string;
	subtitle?: string;
	titleIcon?: React.ReactNode;
}

export const useCreateStepHeaderConfig = (step: CreateStep): StepHeaderConfig => {
	const { t } = useTranslation();

	switch (step) {
		case CreateStep.WalletOverviewStep: {
			return {
				title: t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_STEP.TITLE"),
				titleIcon: (
					<ThemeIcon
						lightIcon="YourPassphraseLight"
						darkIcon="YourPassphraseDark"
						dimIcon="YourPassphraseDim"
						dimensions={[24, 24]}
					/>
				),
			};
		}

		case CreateStep.ConfirmPassphraseStep: {
			return {
				subtitle: t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_CONFIRMATION_STEP.SUBTITLE"),
				title: t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_CONFIRMATION_STEP.TITLE"),
				titleIcon: <Icon name="ConfirmYourPassphrase" dimensions={[24, 24]} />,
			};
		}

		case CreateStep.EncryptPasswordStep: {
			return {
				title: t("WALLETS.PAGE_IMPORT_WALLET.ENCRYPT_PASSWORD_STEP.TITLE"),
				titleIcon: (
					<ThemeIcon
						lightIcon="WalletEncryptionLight"
						darkIcon="WalletEncryptionDark"
						dimIcon="WalletEncryptionDim"
						dimensions={[24, 24]}
					/>
				),
			};
		}

		case CreateStep.SuccessStep: {
			return {
				subtitle: t("WALLETS.PAGE_CREATE_WALLET.PROCESS_COMPLETED_STEP.SUBTITLE"),
				title: t("WALLETS.PAGE_CREATE_WALLET.PROCESS_COMPLETED_STEP.TITLE"),
				titleIcon: (
					<Icon
						name="Completed"
						dimensions={[24, 24]}
						className="text-theme-success-100 dark:text-theme-success-900"
						data-testid="icon-Completed"
					/>
				),
			};
		}

		default: {
			return { title: "" };
		}
	}
};
