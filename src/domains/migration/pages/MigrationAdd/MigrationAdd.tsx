import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import MigrationConnectStep from "@/domains/migration/components/MigrationConnectStep";
import { Form } from "@/app/components/Form";
import { Page, Section } from "@/app/components/Layout";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { StepIndicatorAlt } from "@/app/components/StepIndicatorAlt";
import { MigrationPendingStep } from "@/domains/migration/components/MigrationPendingStep";
import { MigrationSuccessStep } from "@/domains/migration/components/MigrationSuccessStep";
import { MigrationReviewStep } from "@/domains/migration/components/MigrationReviewStep";
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

export const MigrationAdd = () => {
	const { t } = useTranslation();
	const [activeStep, setActiveStep] = useState(Step.Connect);
	const [wallet, setWallet] = useState<Contracts.IReadWriteWallet>();
	const [transaction, setTransaction] = useState<DTO.ExtendedSignedTransactionData>();

	const form = useMigrationForm();

	return (
		<Page pageTitle={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.TITLE")}>
			<Section className="flex-1">
				<Form className="mx-auto max-w-xl" context={form}>
					<StepIndicatorAlt length={TOTAL_STEPS} activeIndex={activeStep} className="mb-8 sm:mx-6 md:mx-0" />

					<Tabs activeId={activeStep}>
						<TabPanel tabId={Step.Connect}>
							<MigrationConnectStep
								onContinue={(selectedWallet) => {
									setWallet(selectedWallet);
									setActiveStep(Step.Review);
								}}
							/>
						</TabPanel>

						<TabPanel tabId={Step.Review}>
							<MigrationReviewStep
								wallet={wallet}
								onBack={() => setActiveStep(Step.Connect)}
								onContinue={() => {
									setTransaction(transaction);
									setActiveStep(Step.Authenticate);
								}}
							/>
						</TabPanel>

						<TabPanel tabId={Step.Authenticate}>
							<MigrationAuthenticationStep
								wallet={wallet}
								onBack={() => {
									setActiveStep(Step.Review);
								}}
								onContinue={(broadcastedTransaction) => {
									setTransaction(broadcastedTransaction);
									setActiveStep(Step.PendingTransaction);
								}}
							/>
						</TabPanel>

						<TabPanel tabId={Step.PendingTransaction}>
							<MigrationPendingStep transaction={transaction} />
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
