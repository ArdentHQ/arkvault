import React from "react";
import { Icon, ThemeIcon } from "@/app/components/Icon";
import { useTranslation } from "react-i18next";

export enum CreateStep {
	MethodStep = 1,
	WalletOverviewStep,
	ConfirmPassphraseStep,
	EncryptPasswordStep,
	SuccessStep,
}

interface ShowFooterOptions {
	activeTab: CreateStep;
	isHDWalletCreation: boolean;
}

interface BackNavigationOptions {
	activeTab: CreateStep;
	usesHDWallets: boolean;
}

const backNavigationMap: Record<CreateStep, CreateStep | null> = {
	[CreateStep.MethodStep]: null,
	[CreateStep.WalletOverviewStep]: CreateStep.MethodStep,
	[CreateStep.ConfirmPassphraseStep]: CreateStep.WalletOverviewStep,
	[CreateStep.EncryptPasswordStep]: CreateStep.ConfirmPassphraseStep,
	[CreateStep.SuccessStep]: CreateStep.EncryptPasswordStep,
};

export const resolveBackNavigation = ({ activeTab, usesHDWallets }: BackNavigationOptions): CreateStep | null => {
	if (!usesHDWallets && activeTab === CreateStep.WalletOverviewStep) {
		return null;
	}

	return backNavigationMap[activeTab];
};

interface NextStepOptions {
	activeTab: CreateStep;
	useEncryption: boolean;
}

const nextStepMap: Record<CreateStep, CreateStep> = {
	[CreateStep.MethodStep]: CreateStep.WalletOverviewStep,
	[CreateStep.WalletOverviewStep]: CreateStep.ConfirmPassphraseStep,
	[CreateStep.ConfirmPassphraseStep]: CreateStep.EncryptPasswordStep,
	[CreateStep.EncryptPasswordStep]: CreateStep.SuccessStep,
	[CreateStep.SuccessStep]: CreateStep.SuccessStep,
};

export const resolveNextStep = ({ activeTab, useEncryption }: NextStepOptions): CreateStep | null => {
	if (activeTab === CreateStep.MethodStep) {
		return null;
	}

	const next = nextStepMap[activeTab];

	if (next === CreateStep.EncryptPasswordStep && !useEncryption) {
		return CreateStep.SuccessStep;
	}

	return next;
};

export const useShowFooter = ({ activeTab, isHDWalletCreation }: ShowFooterOptions): boolean => {
	if (isHDWalletCreation) {
		return activeTab > CreateStep.MethodStep && activeTab !== CreateStep.SuccessStep;
	}

	return activeTab > CreateStep.MethodStep;
};

interface StepHeaderConfig {
	title: string;
	subtitle?: string;
	titleIcon?: React.ReactNode;
}

export const useCreateStepHeaderConfig = (step: CreateStep): StepHeaderConfig => {
	const { t } = useTranslation();

	switch (step) {
		case CreateStep.MethodStep: {
			return {
				subtitle: t("WALLETS.PAGE_CREATE_WALLET.METHOD_STEP.SUBTITLE_WITH_HD"),
				title: t("WALLETS.PAGE_CREATE_WALLET.METHOD_STEP.TITLE"),
			};
		}

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
