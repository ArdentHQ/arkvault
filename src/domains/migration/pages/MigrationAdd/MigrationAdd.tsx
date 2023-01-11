import React, { PropsWithChildren, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { generatePath, useHistory } from "react-router-dom";
import MigrationConnectStep from "@/domains/migration/components/MigrationConnectStep";
import { Form, FormButtons } from "@/app/components/Form";
import { Page, Section } from "@/app/components/Layout";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { StepIndicatorAlt } from "@/app/components/StepIndicatorAlt";
import { MigrationPendingStep } from "@/domains/migration/components/MigrationPendingStep";
import { MigrationSuccessStep } from "@/domains/migration/components/MigrationSuccessStep";
import { MigrationReviewStep } from "@/domains/migration/components/MigrationReviewStep";
import { useActiveProfile, useBreakpoint } from "@/app/hooks";
import { MigrationAuthenticationStep } from "@/domains/migration/components/MigrationAuthenticationStep";
import { useMigrationForm, useMigrationTransaction } from "@/domains/migration/hooks";
import { Button } from "@/app/components/Button";
import { ProfilePaths } from "@/router/paths";

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

export const MigrationAdd = () => {
	const { t } = useTranslation();

	const [activeStep, setActiveStep] = useState(Step.Connect);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [errorMessage, setErrorMessage] = useState<string | undefined>();

	const history = useHistory();
	const { isXs } = useBreakpoint();

	const activeProfile = useActiveProfile();

	const form = useMigrationForm();

	const { formState, watch } = form;
	const { isSubmitting, isValid } = formState;

	const wallet = watch("wallet");

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

		const dashboardPath = generatePath(ProfilePaths.Dashboard, { profileId: activeProfile.id() });
		return history.push(dashboardPath);
	};

	const handleNext = () => {
		const newStep = activeStep + 1;

		if (newStep === Step.Authenticate && wallet?.isLedger()) {
			handleSubmit();
		}

		setActiveStep((index) => index + 1);
	};

	const handleSubmit = async () => {
		try {
			await sendTransaction();

			setActiveStep(Step.PendingTransaction);
		} catch (error) {
			setErrorMessage(JSON.stringify({ message: error.message, type: error.name }));
			setActiveStep(Step.Error);
		}
	};

	const SuccessButtonWrapper = isXs
		? FormButtons
		: ({ children }: { children: React.ReactNode }) => (
				<div className="mt-8 flex items-center justify-center">{children}</div>
		  );

	const hideFormButtons = activeStep > Step.Authenticate || (activeStep === Step.Authenticate && wallet?.isLedger());

	return (
		<Page pageTitle={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.TITLE")}>
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
								<MigrationPendingStep />
								<span onClick={() => setActiveStep(Step.Finished)}>go to success</span>
							</TabPanel>

							<TabPanel tabId={Step.Finished}>
								<MigrationSuccessStep />
								<span onClick={() => setActiveStep(Step.PendingTransaction)}>go to pending</span>
							</TabPanel>

							{!hideFormButtons && (
								<FormButtons>
									<Button
										data-testid="MigrationAdd__back-button"
										variant="secondary"
										onClick={handleBack}
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
