import React, { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { generatePath, useHistory } from "react-router-dom";
import { DTO } from "@ardenthq/sdk-profiles";
import { useTranslation } from "react-i18next";
import { ContractPausedAlert } from "../Migration/Migration.blocks";
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
import { MigrationTransactionStatus } from "@/domains/migration/migration.contracts";
import { ProfilePaths } from "@/router/paths";
import { StepIndicatorAlt } from "@/app/components/StepIndicatorAlt";
import { useMigrations } from "@/app/contexts";
export enum Step {
	Connect = 1,
	Review,
	Authenticate,
	PendingTransaction,
	Finished,
	Error,
}

const TOTAL_STEPS = 5;

const MigrationTabsWrapper: React.FC<PropsWithChildren> = ({ children }) => (
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

	const history = useHistory();

	const activeProfile = useActiveProfile();

	const form = useMigrationForm();

	const { formState, watch } = form;
	const { isSubmitting, isValid } = formState;

	const wallet = watch("wallet");

	const { storeTransaction, migrations } = useMigrations();
	const { sendTransaction, abortTransaction } = useMigrationTransaction({ context: form, profile: activeProfile });

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
			handleSubmit();
		}

		setActiveStep((index) => index + 1);
	};

	const transactionIsConfirmed = useMemo(() => {
		if (transaction === undefined || migrations === undefined) {
			return false;
		}

		const migrationTransaction = migrations.find((migration) => migration.id === transaction.id());

		return migrationTransaction?.status === MigrationTransactionStatus.Confirmed;
	}, [transaction, migrations]);

	const handleSubmit = async () => {
		try {
			const transaction = await sendTransaction();

			storeTransaction(transaction);

			setTransaction(transaction);

			storeTransaction(transaction);

			setActiveStep(Step.PendingTransaction);
		} catch (error) {
			setErrorMessage(JSON.stringify({ message: error.message, type: error.name }));
			setActiveStep(Step.Error);
		}
	};

	useEffect(() => {
		if (transactionIsConfirmed) {
			setActiveStep(Step.Finished);
		}
	}, [transactionIsConfirmed]);

	const hideFormButtons = activeStep > Step.Authenticate || (activeStep === Step.Authenticate && wallet.isLedger());

	return (
		<Page pageTitle={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.TITLE")}>
			<ContractPausedAlert />

			<Section className="flex-1">
				<Form className="mx-auto max-w-xl" context={form} onSubmit={handleSubmit}>
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
								<MigrationPendingStep migrationTransaction={transaction!} />
							</TabPanel>

							<TabPanel tabId={Step.Finished}>
								<MigrationSuccessStep migrationTransaction={transaction!} />
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
											disabled={!isValid}
											onClick={handleNext}
										>
											{t("COMMON.CONTINUE")}
										</Button>
									)}

									{activeStep === Step.Authenticate && (
										<Button
											type="submit"
											disabled={isSubmitting || !isValid}
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
									<Button data-testid="MigrationAdd__back-to-dashboard-button" onClick={handleBack}>
										{t("COMMON.BACK_TO_DASHBOARD")}
									</Button>
								</SuccessButtonWrapper>
							)}
						</Tabs>
					</MigrationTabsWrapper>
				</Form>
			</Section>
		</Page>
	);
};
