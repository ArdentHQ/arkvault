import React from "react";
import { Button } from "@/app/components/Button";
import { useTranslation } from "react-i18next";
import { ImportOption } from "@/domains/wallet/hooks";
import { Icon, ThemeIcon } from "@/app/components/Icon";
import { LedgerTabStep } from "./Ledger/LedgerTabs.contracts";
import { SidePanelButtons } from "@/app/components/SidePanel/SidePanel";
import { HDWalletTabStep } from "@/domains/portfolio/components/ImportWallet/HDWallet/HDWalletsTabs.contracts";

export enum ImportAddressStep {
	MethodStep = 1,
	ImportDetailStep = 2,
	EncryptPasswordStep,
	SummaryStep,
}

export interface StepHeaderConfig {
	title: string;
	subtitle?: string;
	titleIcon?: React.ReactNode;
}

export function useStepHeaderConfig(step: ImportAddressStep, importOption?: ImportOption): StepHeaderConfig {
	const { t } = useTranslation();

	switch (step) {
		case ImportAddressStep.MethodStep: {
			return {
				subtitle: t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.SUBTITLE"),
				title: t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.TITLE"),
			};
		}

		case ImportAddressStep.ImportDetailStep: {
			return {
				subtitle: importOption?.description ?? "",
				title: importOption?.header ?? "",
				titleIcon: importOption?.icon,
			};
		}

		case ImportAddressStep.EncryptPasswordStep: {
			return {
				title: t("WALLETS.PAGE_IMPORT_WALLET.ENCRYPT_PASSWORD_STEP.TITLE"),
				titleIcon: (
					<ThemeIcon
						lightIcon="WalletEncryptionLight"
						darkIcon="WalletEncryptionDark"
						dimIcon="WalletEncryptionDim"
						className="hidden md:block"
						dimensions={[24, 24]}
					/>
				),
			};
		}

		case ImportAddressStep.SummaryStep: {
			return {
				subtitle: t("WALLETS.PAGE_IMPORT_WALLET.SUCCESS_STEP.SUBTITLE"),
				title: t("WALLETS.PAGE_IMPORT_WALLET.SUCCESS_STEP.TITLE"),
				titleIcon: (
					<Icon
						name="Completed"
						className="text-theme-success-100 dark:text-theme-success-900 hidden md:block"
						dimensions={[24, 24]}
						data-testid="icon-Completed"
					/>
				),
			};
		}

		default: {
			return { title: "" };
		}
	}
}

export function useLedgerStepHeaderConfig(step: LedgerTabStep, importOption?: ImportOption): StepHeaderConfig {
	const { t } = useTranslation();

	switch (step) {
		case LedgerTabStep.LedgerConnectionStep: {
			return {
				subtitle: importOption?.description ?? t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.LEDGER_DESCRIPTION"),
				title: importOption?.header ?? t("COMMON.LEDGER"),
				titleIcon: importOption?.icon ?? <Icon name="LedgerImport" className="hidden md:block" />,
			};
		}

		case LedgerTabStep.LedgerScanStep: {
			return {
				subtitle: t("WALLETS.PAGE_IMPORT_WALLET.LEDGER_SCAN_STEP.SUBTITLE"),
				title: t("WALLETS.PAGE_IMPORT_WALLET.LEDGER_SCAN_STEP.TITLE"),
				titleIcon: (
					<Icon name="NoteCheck" dimensions={[22, 22]} className="text-theme-primary-600 hidden md:block" />
				),
			};
		}

		case LedgerTabStep.LedgerImportStep: {
			return {
				subtitle: t("WALLETS.PAGE_IMPORT_WALLET.LEDGER_IMPORT_STEP.SUBTITLE", { count: 2 }),
				title: t("WALLETS.PAGE_IMPORT_WALLET.LEDGER_IMPORT_STEP.TITLE"),
				titleIcon: (
					<Icon
						name="DoubleCheckedCircle"
						className="text-theme-success-100 dark:text-theme-success-900 hidden md:block"
						dimensions={[22, 22]}
					/>
				),
			};
		}

		default: {
			return { title: "" };
		}
	}
}

export function useHDWalletStepHeaderConfig(step: HDWalletTabStep, importOption?: ImportOption): StepHeaderConfig {
	const { t } = useTranslation();

	switch (step) {
		case HDWalletTabStep.SelectAccountStep: {
			return {
				subtitle: t("WALLETS.PAGE_IMPORT_WALLET.HD_WALLET_SELECT_ACCOUNT_STEP.SUBTITLE"),
				title: t("WALLETS.PAGE_IMPORT_WALLET.HD_WALLET_SELECT_ACCOUNT_STEP.TITLE"),
				titleIcon: <Icon name="HDWalletImportMethod" className="hidden md:block" />,
			};
		}

		case HDWalletTabStep.EnterMnemonicStep: {
			return {
				subtitle: t("WALLETS.PAGE_IMPORT_WALLET.HD_WALLET_ENTER_MNEMONIC_STEP.SUBTITLE"),
				title: t("WALLETS.PAGE_IMPORT_WALLET.HD_WALLET_ENTER_MNEMONIC_STEP.TITLE"),
				titleIcon: <Icon name="MnemonicImportMethod" className="hidden md:block" />,
			};
		}

		case HDWalletTabStep.EncryptPasswordStep: {
			return {
				title: t("WALLETS.PAGE_IMPORT_WALLET.ENCRYPT_PASSWORD_STEP.TITLE"),
				titleIcon: (
					<ThemeIcon
						lightIcon="WalletEncryptionLight"
						darkIcon="WalletEncryptionDark"
						dimIcon="WalletEncryptionDim"
						className="hidden md:block"
						dimensions={[24, 24]}
					/>
				),
			};
		}

		case HDWalletTabStep.SelectAddressStep: {
			return {
				subtitle: t("WALLETS.PAGE_IMPORT_WALLET.HD_WALLET_SELECT_ADDRESS_STEP.SUBTITLE"),
				title: t("WALLETS.PAGE_IMPORT_WALLET.HD_WALLET_SELECT_ADDRESS_STEP.TITLE"),
				titleIcon: (
					<Icon name="NoteCheck" dimensions={[22, 22]} className="text-theme-primary-600 hidden md:block" />
				),
			};
		}

		case HDWalletTabStep.SummaryStep: {
			return {
				subtitle: t("WALLETS.PAGE_IMPORT_WALLET.HD_WALLET_SUMMARY_STEP.SUBTITLE"),
				title: t("WALLETS.PAGE_IMPORT_WALLET.HD_WALLET_SUMMARY_STEP.TITLE"),
				titleIcon: (
					<Icon
						name="DoubleCheckedCircle"
						className="text-theme-success-100 dark:text-theme-success-900 hidden md:block"
						dimensions={[22, 22]}
					/>
				),
			};
		}

		default: {
			return { title: "" };
		}
	}
}

export const ImportActionToolbar = ({
	onBack,
	onContinue,
	isLoading,
	isBackDisabled,
	isContinueDisabled,
	showButtons,
	isSubmitDisabled,
	showPortfoliobutton,
	onSubmit,
}: {
	showButtons?: boolean;
	isLoading?: boolean;
	isContinueDisabled?: boolean;
	isBackDisabled?: boolean;
	isSubmitDisabled?: boolean;
	showPortfoliobutton?: boolean;
	onBack?: () => void;
	onContinue?: () => void;
	onSubmit?: () => void;
}) => {
	const { t } = useTranslation();
	return (
		<SidePanelButtons>
			{showButtons && (
				<>
					<Button
						disabled={isBackDisabled}
						variant="secondary"
						onClick={onBack}
						data-testid="ImportWallet__back-button"
					>
						{t("COMMON.BACK")}
					</Button>

					<Button
						disabled={isContinueDisabled}
						isLoading={isLoading}
						onClick={onContinue}
						data-testid="ImportWallet__continue-button"
					>
						{t("COMMON.CONTINUE")}
					</Button>
				</>
			)}

			{showPortfoliobutton && (
				<Button disabled={isSubmitDisabled} data-testid="ImportWallet__finish-button" onClick={onSubmit}>
					{t("COMMON.CLOSE")}
				</Button>
			)}
		</SidePanelButtons>
	);
};
