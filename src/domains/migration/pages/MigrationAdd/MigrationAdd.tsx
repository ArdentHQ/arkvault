import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import MigrationConnectStep from "@/domains/migration/components/MigrationConnectStep";
import { Form } from "@/app/components/Form";
import { Page, Section } from "@/app/components/Layout";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { StepIndicatorAlt } from "@/app/components/StepIndicatorAlt";
import { MigrationPendingStep } from "@/domains/migration/components/MigrationPendingStep";
import { MigrationSuccessStep } from "@/domains/migration/components/MigrationSuccessStep";
import { MigrationReviewStep } from "@/domains/migration/components/MigrationReviewStep";
import { useActiveProfile } from "@/app/hooks";
import { MigrationAuthenticationStep } from "@/domains/migration/components/MigrationAuthenticationStep";
import { useMigrationForm } from "@/domains/migration/hooks";

export enum Step {
	Connect = 1,
	Review = 2,
	Authenticate = 3,
	PendingTransaction = 4,
	Finished = 5,
	Error = 6,
}

const TOTAL_STEPS = 5;

const submitHandler = () => {};

export const MigrationAdd = () => {
	const { t } = useTranslation();
	const [activeStep, setActiveStep] = useState(Step.PendingTransaction);

	const form = useMigrationForm();

	const activeProfile = useActiveProfile();
	//TODO: remove hardcoded wallet.
	const wallet = activeProfile.wallets().first();

	return (
		<Page pageTitle={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.TITLE")}>
			<Section className="flex-1">
				<Form className="mx-auto max-w-xl" context={form} onSubmit={submitHandler}>
					<StepIndicatorAlt length={TOTAL_STEPS} activeIndex={activeStep} className="mb-8 sm:mx-6 md:mx-0" />

					<Tabs activeId={activeStep}>
						<TabPanel tabId={Step.Connect}>
							<MigrationConnectStep />
						</TabPanel>

						<TabPanel tabId={Step.Review}>
							<MigrationReviewStep
								wallet={wallet}
								onContinue={() => setActiveStep(Step.Authenticate)}
								onBack={() => setActiveStep(Step.Connect)}
							/>
						</TabPanel>
						<TabPanel tabId={Step.Authenticate}>
							<MigrationAuthenticationStep
								wallet={wallet}
								onContinue={() => setActiveStep(Step.PendingTransaction)}
								onBack={() => setActiveStep(Step.Connect)}
								onError={() => setActiveStep(Step.Error)}
							/>
						</TabPanel>

						<TabPanel tabId={Step.PendingTransaction}>
							<MigrationPendingStep />
						</TabPanel>

						<TabPanel tabId={Step.Finished}>
							<MigrationSuccessStep />
						</TabPanel>
					</Tabs>
				</Form>
			</Section>
		</Page>
	);
};
