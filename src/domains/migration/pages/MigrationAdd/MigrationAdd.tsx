import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import MigrationConnectStep from "@/domains/migration/components/MigrationConnectStep";
import { Form } from "@/app/components/Form";
import { Page, Section } from "@/app/components/Layout";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { StepIndicatorAlt } from "@/app/components/StepIndicatorAlt";
import { MigrationSuccessStep } from "@/domains/migration/components/MigrationSuccessStep";

enum Step {
	Connect = 1,
	Review = 2,
	Authenticate = 3,
	PendingTransaction = 4,
	Finished = 5,
}

const TOTAL_STEPS = 5;

const submitHandler = () => {};

export const MigrationAdd = () => {
	const { t } = useTranslation();

	const form = useForm<any>({
		defaultValues: {},
		mode: "onChange",
	});

	const activeTab = useMemo(() => Step.Finished, []);

	return (
		<Page pageTitle={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.TITLE")}>
			<Section className="flex-1">
				<Form className="mx-auto max-w-xl" context={form} onSubmit={submitHandler}>
					<StepIndicatorAlt length={TOTAL_STEPS} activeIndex={activeTab} className="mb-8 sm:mx-6 md:mx-0" />

					<Tabs activeId={activeTab}>
						<TabPanel tabId={Step.Connect}>
							<MigrationConnectStep />
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
