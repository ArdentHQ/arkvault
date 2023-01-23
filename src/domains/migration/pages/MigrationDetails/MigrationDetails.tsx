import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MigrationTabsWrapper, Step, SuccessButtonWrapper } from "@/domains/migration/pages/MigrationAdd/MigrationAdd";
import { ContractPausedAlert } from "@/domains/migration/pages/Migration/Migration.blocks";
import { Page, Section } from "@/app/components/Layout";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { MigrationPendingStep } from "@/domains/migration/components/MigrationPendingStep";
import { MigrationSuccessStep } from "@/domains/migration/components/MigrationSuccessStep";
import { MigrationTransaction, MigrationTransactionStatus } from "@/domains/migration/migration.contracts";
import { StepIndicatorAlt } from "@/app/components/StepIndicatorAlt";
import { Button } from "@/app/components/Button";

const TOTAL_STEPS = 5;
interface Properties {
	migrationTransaction: MigrationTransaction;
	handleBack: () => void;
}

export const MigrationDetails = ({ migrationTransaction, handleBack }: Properties) => {
	const { t } = useTranslation();

	const [activeStep, setActiveStep] = useState(Step.Connect);

	const transactionIsConfirmed = useMemo(
		() => migrationTransaction.status === MigrationTransactionStatus.Confirmed,
		[migrationTransaction],
	);

	useEffect(() => {
		if (transactionIsConfirmed) {
			setActiveStep(Step.Finished);
		} else {
			setActiveStep(Step.PendingTransaction);
		}
	}, [transactionIsConfirmed]);

	return (
		<Page pageTitle={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.TITLE")}>
			<ContractPausedAlert />

			<Section className="flex-1">
				<div className="mx-auto max-w-xl">
					<StepIndicatorAlt length={TOTAL_STEPS} activeIndex={activeStep} className="mb-8 sm:mx-10 md:mx-0" />

					<MigrationTabsWrapper>
						<Tabs activeId={activeStep}>
							<TabPanel tabId={Step.PendingTransaction}>
								<MigrationPendingStep
									migrationTransaction={migrationTransaction.transaction}
									handleBack={handleBack}
								/>
							</TabPanel>

							<TabPanel tabId={Step.Finished}>
								<MigrationSuccessStep migrationTransaction={migrationTransaction.transaction} />
							</TabPanel>

							{activeStep === Step.Finished && (
								<SuccessButtonWrapper>
									<Button data-testid="MigrationAdd__back-to-dashboard-button" onClick={handleBack}>
										{t("COMMON.BACK_TO_DASHBOARD")}
									</Button>
								</SuccessButtonWrapper>
							)}
						</Tabs>
					</MigrationTabsWrapper>
				</div>
			</Section>
		</Page>
	);
};
