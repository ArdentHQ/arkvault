import React from "react";

import { FormStep } from "./FormStep";
import { ReviewStep } from "./ReviewStep";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { TransactionFee } from "@/domains/transaction/components/TransactionDetail";
import {
	SendRegistrationComponent,
	SendRegistrationDetailsOptions,
	SendRegistrationForm,
} from "@/domains/transaction/pages/SendRegistration/SendRegistration.contracts";

const StepsComponent = ({ activeTab, wallet, profile }: SendRegistrationComponent) => (
	<Tabs activeId={activeTab}>
		<TabPanel tabId={1}>
			<FormStep wallet={wallet} profile={profile} />
		</TabPanel>
		<TabPanel tabId={2}>
			<ReviewStep wallet={wallet} />
		</TabPanel>
	</Tabs>
);

const transactionDetails = ({ transaction, wallet }: SendRegistrationDetailsOptions) => (
	<TransactionFee currency={wallet.currency()} value={transaction.fee()} paddingPosition="top" />
);

StepsComponent.displayName = "MultiSignatureRegistrationForm";
transactionDetails.displayName = "MultiSignatureRegistrationFormTransactionDetails";

export const MultiSignatureRegistrationForm: SendRegistrationForm = {
	component: StepsComponent,
	formFields: ["participants", "minParticipants"],
	tabSteps: 2,
	transactionDetails,
};
