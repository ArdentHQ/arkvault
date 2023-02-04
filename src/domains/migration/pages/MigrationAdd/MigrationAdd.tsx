import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import { generatePath, useHistory } from "react-router-dom";
import { DTO } from "@ardenthq/sdk-profiles";
import { useTranslation } from "react-i18next";
import { ContractPausedAlert } from "@/domains/migration/pages/Migration/Migration.blocks";
import { Form, FormButtons } from "@/app/components/Form";
import { Page, Section } from "@/app/components/Layout";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { useActiveProfile, useBreakpoint } from "@/app/hooks";
import { useMigrationForm, useMigrationTransaction } from "@/domains/migration/hooks";

import { Button } from "@/app/components/Button";
import { MigrationAuthenticationStep } from "@/domains/migration/components/MigrationAuthenticationStep";
import MigrationConnectStep from "@/domains/migration/components/MigrationConnectStep";
import { MigrationErrorStep } from "@/domains/migration/components/MigrationErrorStep";
import { MigrationPendingStep } from "@/domains/migration/components/MigrationPendingStep";
import { MigrationReviewStep } from "@/domains/migration/components/MigrationReviewStep";
import { MigrationSuccessStep } from "@/domains/migration/components/MigrationSuccessStep";
import { Migration, MigrationTransactionStatus } from "@/domains/migration/migration.contracts";
import { ProfilePaths } from "@/router/paths";
import { StepIndicatorAlt } from "@/app/components/StepIndicatorAlt";
import { useMigrations } from "@/app/contexts";
import { MultiSignatureSuccessful } from "@/domains/transaction/components/TransactionSuccessful";
export enum Step {
	Connect = 1,
	Review,
	Authenticate,
	PendingTransaction,
	Finished,
	Error,
}

const TOTAL_STEPS = 5;

export const MigrationTabsWrapper: React.FC<PropsWithChildren> = ({ children }) => (
	<div className="mt-6 dark:border-theme-secondary-800 sm:rounded-2.5xl sm:border sm:border-theme-secondary-300 sm:p-10 md:-mx-10">
		{children}
	</div>
);

export const SuccessButtonWrapper = ({ children }: { children: React.ReactNode }) => {
	const { isXs } = useBreakpoint();

	if (isXs) {
		return <FormButtons>{children}</FormButtons>;
	}

	return <div className="mt-8 flex items-center justify-center">{children}</div>;
};

export const MigrationAdd = () => {
	const { t } = useTranslation();

	const [activeStep, setActiveStep] = useState(Step.Connect);
	const [errorMessage, setErrorMessage] = useState<string | undefined>();

	const [transaction, setTransaction] = useState<DTO.ExtendedSignedTransactionData | undefined>(undefined);
	const [migrationTransaction, setMigrationTransaction] = useState<Migration | undefined>();

	const history = useHistory();

	const activeProfile = useActiveProfile();

	const form = useMigrationForm();

	const { formState, watch } = form;
	const { isSubmitting, isDirty, isValid } = formState;

	const wallet = watch("wallet");

	const { storeTransactions, migrations, contractIsPaused } = useMigrations();
	const { sendTransaction, abortTransaction } = useMigrationTransaction({
		context: form,
		profile: activeProfile,
	});

	useEffect(
		() => () => {
			abortTransaction();
		},
		[],
	);

	const handleBack = () => {
		if (activeStep === Step.Connect) {
			const migrationsPath = generatePath(ProfilePaths.Migration, { profileId: activeProfile.id() });
			return history.push(migrationsPath);
		}

		if (activeStep === Step.Review || activeStep === Step.Authenticate) {
			return setActiveStep((activeStep) => activeStep - 1);
		}

		if (activeStep === Step.Error) {
			const walletPath = generatePath(ProfilePaths.WalletDetails, {
				profileId: activeProfile.id(),
				walletId: wallet.id(),
			});
			return history.push(walletPath);
		}

		const dashboardPath = generatePath(ProfilePaths.Dashboard, { profileId: activeProfile.id() });
		return history.push(dashboardPath);
	};

	const handleNext = () => {
		const newStep = activeStep + 1;

		if (newStep === Step.Authenticate && wallet.isLedger()) {
			form.handleSubmit(() => submit())();
		}

		if (newStep === Step.Authenticate && wallet.isMultiSignature()) {
			form.handleSubmit(() => submit())();
			return;
		}

		setActiveStep((index) => index + 1);
	};

	useEffect(() => {
		if (transaction === undefined || migrations === undefined) {
			return;
		}

		const migrationTransaction = migrations.find((migration) => migration.id === transaction.id());

		if (
			migrationTransaction?.status === MigrationTransactionStatus.Confirmed &&
			migrationTransaction?.migrationId
		) {
			setMigrationTransaction(migrationTransaction);
			setActiveStep(Step.Finished);
		}
	}, [transaction, migrations]);

	const submit = async () => {
		try {
			const transaction = await sendTransaction();
			setTransaction(transaction);

			if (wallet.isMultiSignature()) {
				setActiveStep(Step.Finished);
				return;
			}

			setMigrationTransaction({
				address: transaction.sender(),
				amount: transaction.amount(),
				id: transaction.id(),
				migrationAddress: transaction.memo()!,
				status: MigrationTransactionStatus.Pending,
				timestamp: transaction.timestamp()!.toUNIX(),
			});

			await storeTransactions([transaction]);
			setActiveStep(Step.PendingTransaction);
		} catch (error) {
			setErrorMessage(JSON.stringify({ message: error.message, type: error.name }));
			setActiveStep(Step.Error);
		}
	};

	const hideFormButtons = activeStep > Step.Authenticate || (activeStep === Step.Authenticate && wallet.isLedger());

	const isNextDisabled = isDirty ? !isValid : true;

	const reference = useRef<HTMLDivElement>(null);

	return (
		<Page pageTitle={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.TITLE")}>
			<ContractPausedAlert />

			<Section className="flex-1">
				<Form className="mx-auto max-w-xl" context={form} onSubmit={submit}>
					<div ref={reference}>
						<StepIndicatorAlt
							length={TOTAL_STEPS}
							activeIndex={activeStep === Step.Error ? Step.Authenticate : activeStep}
							className="mb-8 sm:mx-10 md:mx-0"
						/>

						<MigrationTabsWrapper>
							<Tabs activeId={activeStep}>
								<TabPanel tabId={Step.Connect}>
									<MigrationConnectStep />
								</TabPanel>

								<TabPanel tabId={Step.Review}>
									<MigrationReviewStep />
								</TabPanel>

								<TabPanel tabId={Step.Authenticate}>
									<MigrationAuthenticationStep />
								</TabPanel>

								<TabPanel tabId={Step.PendingTransaction}>
									{migrationTransaction && (
										<MigrationPendingStep migrationTransaction={migrationTransaction} />
									)}
								</TabPanel>

								<TabPanel tabId={Step.Finished}>
									{wallet?.isMultiSignature() && (
										<MultiSignatureSuccessful senderWallet={wallet} transaction={transaction} />
									)}

									{migrationTransaction && (
										<MigrationSuccessStep
											migrationTransaction={migrationTransaction}
											reference={reference}
										/>
									)}
								</TabPanel>

								<TabPanel tabId={Step.Error}>
									<MigrationErrorStep errorMessage={errorMessage} onBack={handleBack} />
								</TabPanel>

								{!hideFormButtons && (
									<FormButtons>
										<Button
											data-testid="MigrationAdd__back-button"
											variant="secondary"
											onClick={handleBack}
											disabled={isSubmitting}
										>
											{activeStep === Step.Connect ? t("COMMON.CANCEL") : t("COMMON.BACK")}
										</Button>

										{activeStep < Step.Authenticate && (
											<Button
												data-testid="MigrationAdd__continue-button"
												variant="primary"
												disabled={contractIsPaused || isNextDisabled || isSubmitting}
												isLoading={isSubmitting}
												onClick={handleNext}
											>
												{t("COMMON.CONTINUE")}
											</Button>
										)}

										{activeStep === Step.Authenticate && (
											<Button
												type="submit"
												disabled={contractIsPaused || isSubmitting || isNextDisabled}
												data-testid="MigrationAdd__send-button"
												isLoading={isSubmitting}
												icon="DoubleArrowRight"
												iconPosition="right"
											>
												<span>{t("COMMON.SEND")}</span>
											</Button>
										)}
									</FormButtons>
								)}

								{activeStep === Step.Finished && (
									<SuccessButtonWrapper>
										<Button
											data-testid="MigrationAdd__back-to-migration-button"
											onClick={handleBack}
										>
											{t("MIGRATION.BACK_TO_MIGRATION")}
										</Button>
									</SuccessButtonWrapper>
								)}
							</Tabs>
						</MigrationTabsWrapper>
					</div>
				</Form>
			</Section>
		</Page>
	);
};
