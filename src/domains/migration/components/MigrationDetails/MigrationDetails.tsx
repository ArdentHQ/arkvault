import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MigrationTabsWrapper, Step, SuccessButtonWrapper } from "@/domains/migration/pages/MigrationAdd/MigrationAdd";
import { ContractPausedAlert } from "@/domains/migration/pages/Migration/Migration.blocks";
import { Section } from "@/app/components/Layout";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { Button } from "@/app/components/Button";
import { MigrationPendingStep } from "@/domains/migration/components/MigrationPendingStep";
import { MigrationSuccessStep } from "@/domains/migration/components/MigrationSuccessStep";
import { Migration, MigrationTransactionStatus } from "@/domains/migration/migration.contracts";
import { StepIndicatorAlt } from "@/app/components/StepIndicatorAlt";

const TOTAL_STEPS = 5;

interface Properties {
	migrationTransaction: Migration;
	handleBack: () => void;
}

export const MigrationDetails = ({ migrationTransaction, handleBack }: Properties) => {
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

	const reference = useRef<HTMLDivElement>(null);

	return (
		<>
			<ContractPausedAlert />

			<Section className="flex-1">
				<div ref={reference} data-testid="MigrationDetails" className="mx-auto max-w-xl">
					<StepIndicatorAlt length={TOTAL_STEPS} activeIndex={activeStep} className="mb-8 sm:mx-10 md:mx-0" />

					<MigrationTabsWrapper>
						<Tabs activeId={activeStep}>
							<TabPanel tabId={Step.PendingTransaction}>
								<MigrationPendingStep
									migrationTransaction={migrationTransaction}
									handleBack={handleBack}
								/>
							</TabPanel>

							<TabPanel tabId={Step.Finished}>
								<MigrationSuccessStep
									migrationTransaction={migrationTransaction}
									reference={reference}
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
		</>
	);
};
