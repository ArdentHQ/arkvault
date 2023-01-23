import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DTO } from "@ardenthq/sdk-profiles";
import { MigrationTabsWrapper, Step, SuccessButtonWrapper } from "@/domains/migration/pages/MigrationAdd/MigrationAdd";
import { ContractPausedAlert } from "@/domains/migration/pages/Migration/Migration.blocks";
import { Page, Section } from "@/app/components/Layout";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { Button } from "@/app/components/Button";
import { MigrationPendingStep } from "@/domains/migration/components/MigrationPendingStep";
import { MigrationSuccessStep } from "@/domains/migration/components/MigrationSuccessStep";
import { MigrationTransactionStatus } from "@/domains/migration/migration.contracts";
import { StepIndicatorAlt } from "@/app/components/StepIndicatorAlt";
import { useMigrations } from "@/app/contexts";

const TOTAL_STEPS = 5;
interface Properties {
	transaction: DTO.ExtendedConfirmedTransactionData;
	handleBack: () => void;
}

export const MigrationDetails = ({ transaction, handleBack }: Properties) => {
	const { t } = useTranslation();

	const [activeStep, setActiveStep] = useState(Step.Connect);

	const { migrations } = useMigrations();

	const transactionIsConfirmed = useMemo(() => {
		if (transaction === undefined || migrations === undefined) {
			return false;
		}

		const migrationTransaction = migrations.find((migration) => migration.id === transaction.id());

		return migrationTransaction?.status === MigrationTransactionStatus.Confirmed;
	}, [transaction, migrations]);

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
				<div data-testid="MigrationDetails" className="mx-auto max-w-xl">
					<StepIndicatorAlt length={TOTAL_STEPS} activeIndex={activeStep} className="mb-8 sm:mx-10 md:mx-0" />

					<MigrationTabsWrapper>
						<Tabs activeId={activeStep}>
							<TabPanel tabId={Step.PendingTransaction}>
								<MigrationPendingStep migrationTransaction={transaction} handleBack={handleBack} />
							</TabPanel>

							<TabPanel tabId={Step.Finished}>
								<MigrationSuccessStep migrationTransaction={transaction} />
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
