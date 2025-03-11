import React from "react";
import { Button } from "@/app/components/Button";
import { StepIndicator } from "@/app/components/StepIndicator";
import { useTranslation } from "react-i18next";
import { Header } from "@/app/components/Header";
import { Icon, ThemeIcon } from "@/app/components/Icon";
import { ImportOption } from "@/domains/wallet/hooks";
import { LedgerTabStep } from "./Ledger/LedgerTabs.contracts";

enum Step {
	MethodStep = 1,
	ImportDetailStep = 2,
	EncryptPasswordStep,
	SummaryStep,
}

export const ImportActionToolbar = ({
	showSteps,
	activeTab,
	allSteps,
	onBack,
	onContinue,
	isLoading,
	isBackDisabled,
	isContinueDisabled,
	showButtons,
	isSubmitDisabled,
}: {
	showButtons?: boolean;
	isLoading?: boolean;
	showSteps?: boolean;
	activeTab: number;
	allSteps: string[];
	isContinueDisabled?: boolean;
	isBackDisabled?: boolean;
	isSubmitDisabled?: boolean;
	onBack?: () => void;
	onContinue?: () => void;
}) => {
	const { t } = useTranslation();
	return (
		<div className="fixed inset-x-0 bottom-0 mr-[5px] flex items-center justify-end bg-theme-background p-2 px-4 sm:justify-between sm:px-6 sm:py-6 md:px-8">
			{showSteps && (
				<div className="hidden w-[136px] sm:block">
					<StepIndicator steps={allSteps} activeIndex={activeTab} showTitle={false} />
				</div>
			)}

			<div className="flex w-full gap-3 sm:justify-end [&>button]:flex-1 sm:[&>button]:flex-none">
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

				{activeTab === Step.SummaryStep && (
					<Button disabled={isSubmitDisabled} type="submit" data-testid="ImportWallet__finish-button">
						{t("COMMON.GO_TO_PORTFOLIO")}
					</Button>
				)}
			</div>
		</div>
	);
};


export const StepHeader = ({ step, importOption }: { step: Step; importOption: ImportOption | undefined }): JSX.Element => {
	const { t } = useTranslation();

	const headers: Record<Step, JSX.Element> = {
		[Step.MethodStep]: (
			<Header
				titleClassName="text-lg md:text-2xl md:leading-[29px]"
				title={t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.TITLE")}
				subtitle={t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.SUBTITLE")}
				className="mt-px"
			/>
		),
		[Step.ImportDetailStep]: (
			<Header
				titleClassName="text-lg md:text-2xl md:leading-[29px]"
				title={importOption?.header ?? ""}
				subtitle={importOption?.description ?? ""}
				titleIcon={
					importOption?.icon ? (
						<div className="text-theme-primary-600 dark:text-theme-navy-500"> {importOption.icon} </div>
					) : undefined
				}
				className="mt-px"
			/>
		),
		[Step.EncryptPasswordStep]: (
			<Header
				titleClassName="text-lg md:text-2xl md:leading-[29px]"
				title={t("WALLETS.PAGE_IMPORT_WALLET.ENCRYPT_PASSWORD_STEP.TITLE")}
				className="mt-px"
				titleIcon={
					<ThemeIcon
						lightIcon="WalletEncryptionLight"
						darkIcon="WalletEncryptionDark"
						dimensions={[24, 24]}
					/>
				}
			/>
		),
		[Step.SummaryStep]: (
			<Header
				titleClassName="text-lg md:text-2xl md:leading-[29px]"
				className="mt-px"
				title={t("WALLETS.PAGE_IMPORT_WALLET.SUCCESS_STEP.TITLE")}
				titleIcon={
					<Icon
						className="text-theme-success-100 dark:text-theme-success-900"
						dimensions={[24, 24]}
						name="Completed"
						data-testid="icon-Completed"
					/>
				}
				subtitle={t("WALLETS.PAGE_IMPORT_WALLET.SUCCESS_STEP.SUBTITLE")}
			/>
		),
	};

	return headers[step];
};

export const LedgerStepHeader = ({ step, importOption }: { step: Step; importOption: ImportOption | undefined }): JSX.Element => {
	const { t } = useTranslation();

	console.log({ import})
	const headers: Record<string, JSX.Element> = {
		[LedgerTabStep.LedgerConnectionStep]: (
			<Header
				titleClassName="text-lg md:text-2xl md:leading-[29px]"
				title={importOption?.header ?? ""}
				subtitle={importOption?.description ?? ""}
				titleIcon={
					importOption?.icon ? (
						<div className="text-theme-primary-600 dark:text-theme-navy-500"> {importOption.icon} </div>
					) : undefined
				}
				className="mt-px"
			/>
		),
		[LedgerTabStep.LedgerScanStep]: (
			<Header
				title={t("WALLETS.PAGE_IMPORT_WALLET.LEDGER_SCAN_STEP.TITLE")}
				subtitle={t("WALLETS.PAGE_IMPORT_WALLET.LEDGER_SCAN_STEP.SUBTITLE")}
				titleIcon={<Icon name="NoteCheck" dimensions={[22, 22]} className="text-theme-primary-600" />}
				className="hidden sm:block"
			/>
		),
		[LedgerTabStep.LedgerImportStep]: (
			<Header
				title={t("WALLETS.PAGE_IMPORT_WALLET.LEDGER_IMPORT_STEP.TITLE")}
				subtitle={t("WALLETS.PAGE_IMPORT_WALLET.LEDGER_IMPORT_STEP.SUBTITLE", { count: 2 })}
				titleIcon={
					<Icon
						name="DoubleCheckedCircle"
						className="text-theme-success-100 dark:text-theme-success-900"
						dimensions={[22, 22]}
					/>
				}
				className="mb-4 hidden sm:block"
			/>
		)
	};

	return headers[step];
};
