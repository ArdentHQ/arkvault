import React, { useLayoutEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DTO } from "@ardenthq/sdk-profiles";
import { MigrationTabsWrapper, Step, SuccessButtonWrapper } from "@/domains/migration/pages/MigrationAdd/MigrationAdd";
import { ContractPausedAlert } from "@/domains/migration/pages/Migration/Migration.blocks";
import { Page, Section } from "@/app/components/Layout";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { Button } from "@/app/components/Button";
import { MigrationPendingStep } from "@/domains/migration/components/MigrationPendingStep";
import { MigrationSuccessStep } from "@/domains/migration/components/MigrationSuccessStep";
import { Migration, MigrationTransactionStatus } from "@/domains/migration/migration.contracts";
import { StepIndicatorAlt } from "@/app/components/StepIndicatorAlt";

const TOTAL_STEPS = 5;

interface Properties {
	migrationTransaction: Migration;
	transaction: DTO.ExtendedConfirmedTransactionData;
	handleBack: () => void;
}

export const MigrationDetails = ({ transaction, migrationTransaction, handleBack }: Properties) => {
	const { t } = useTranslation();

	const [activeStep, setActiveStep] = useState<Step | undefined>();

	const transactionIsConfirmed = useMemo(
		() => migrationTransaction.status === MigrationTransactionStatus.Confirmed,
		[migrationTransaction],
	);

	useLayoutEffect(() => {
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
				<div data-testid="MigrationDetails" className="mx-auto max-w-xl">
					<StepIndicatorAlt length={TOTAL_STEPS} activeIndex={activeStep} className="mb-8 sm:mx-10 md:mx-0" />

					<MigrationTabsWrapper>
						<Tabs activeId={activeStep}>
							<TabPanel tabId={Step.PendingTransaction}>
								<MigrationPendingStep transaction={transaction} handleBack={handleBack} />
							</TabPanel>

							<TabPanel tabId={Step.Finished}>
								<MigrationSuccessStep
									transaction={transaction}
									migrationTransaction={migrationTransaction}
								/>
							</TabPanel>

							{activeStep === Step.Finished && (
								<SuccessButtonWrapper>
									<Button data-testid="MigrationAdd__back-to-migration-button" onClick={handleBack}>
										{t("MIGRATION.BACK_TO_MIGRATION")}
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
