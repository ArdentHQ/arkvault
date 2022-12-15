import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import MigrationConnectStep from "@/domains/migration/components/MigrationConnectStep";
import { Form } from "@/app/components/Form";
import { Page, Section } from "@/app/components/Layout";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { StepIndicatorAlt } from "@/app/components/StepIndicatorAlt";

enum Step {
	Connect = 1,
	Review = 2,
	Authenticate = 3,
	PendingTransaction = 4,
	Finished = 5,
}

const TOTAL_STEPS = 5;

export const MigrationAdd = () => {
	const { t } = useTranslation();

	const form = useForm<any>({
		defaultValues: {},
		mode: "onChange",
	});

	const submitHandler = () => {};

	const activeTab = useMemo(() => Step.Connect, []);

	return (
		<Page pageTitle={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.TITLE")}>
			<Section className="flex-1">
				<Form className="mx-auto max-w-xl" context={form} onSubmit={submitHandler}>
					<StepIndicatorAlt length={TOTAL_STEPS} activeIndex={activeTab} className="mx-8 mb-8" />

					<Tabs activeId={activeTab}>
						<TabPanel tabId={Step.Connect}>
							<MigrationConnectStep />
						</TabPanel>
						{/*

							{activeTab <= Step.EncryptPasswordStep && (
								<FormButtons>
									{activeTab < Step.SuccessStep && (
										<Button
											data-testid="CreateWallet__back-button"
											disabled={isGeneratingWallet}
											variant="secondary"
											onClick={handleBack}
										>
											{t("COMMON.BACK")}
										</Button>
									)}

									{activeTab < Step.EncryptPasswordStep && (
										<Button
											data-testid="CreateWallet__continue-button"
											disabled={isDirty ? !isValid || isGeneratingWallet : true}
											isLoading={isGeneratingWallet && activeTab === Step.NetworkStep}
											onClick={() => handleNext()}
										>
											{t("COMMON.CONTINUE")}
										</Button>
									)}

									{activeTab === Step.EncryptPasswordStep && (
										<Button
											data-testid="CreateWallet__continue-encryption-button"
											disabled={
												!isValid ||
												isGeneratingWallet ||
												!encryptionPassword ||
												!confirmEncryptionPassword
											}
											isLoading={isGeneratingWallet}
											onClick={handlePasswordSubmit}
										>
											{t("COMMON.CONTINUE")}
										</Button>
									)}
								</FormButtons>
							)}

							{activeTab === Step.SuccessStep && (
								<FormButtons>
									<Button
										disabled={isSubmitting}
										type="submit"
										data-testid="CreateWallet__finish-button"
									>
										{t("COMMON.GO_TO_WALLET")}
									</Button>
								</FormButtons>
							)} */}
					</Tabs>
				</Form>
			</Section>
		</Page>
	);
};
