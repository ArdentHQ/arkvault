import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import MigrationConnectStep from "@/domains/migration/components/MigrationConnectStep";
import { Form } from "@/app/components/Form";
import { Page, Section } from "@/app/components/Layout";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { StepIndicatorAlt } from "@/app/components/StepIndicatorAlt";
import { MigrationReviewStep } from "@/domains/migration/components/MigrationReviewStep";
import { useActiveProfile } from "@/app/hooks";

const TRANSACTION_FEE = Number.parseFloat(import.meta.env.VITE_POLYGON_MIGRATION_TRANSACTION_FEE || 0.05);

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
	const [activeTab, setActiveTab] = useState(Step.Review);
	const activeProfile = useActiveProfile();

	const form = useForm<any>({
		defaultValues: {
			fee: TRANSACTION_FEE,
			// TODO: remove hardcoded address.
			receiverAddress: "0x080de88aE69Bc02eB8csr34E863B7F428699bb20",
		},
		mode: "onChange",
		shouldUnregister: false,
	});

	useEffect(() => {
		form.register("fee");
	}, []);

	// TODO: remove hardcoded wallet.
	const wallet = activeProfile.wallets().first();

	return (
		<Page pageTitle={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.TITLE")}>
			<Section className="flex-1">
				<Form className="mx-auto max-w-xl" context={form} onSubmit={submitHandler}>
					<StepIndicatorAlt length={TOTAL_STEPS} activeIndex={activeTab} className="mb-8 sm:mx-6 md:mx-0" />

					<Tabs activeId={activeTab}>
						<TabPanel tabId={Step.Connect}>
							<MigrationConnectStep />
						</TabPanel>

						<TabPanel tabId={Step.Review}>
							<MigrationReviewStep
								wallet={wallet}
								onContinue={() => setActiveTab(Step.Authenticate)}
								onCancel={() => setActiveTab(Step.Connect)}
							/>
						</TabPanel>
					</Tabs>
				</Form>
			</Section>
		</Page>
	);
};
