import { Contracts, DTO } from "@/app/lib/profiles";
import React from "react";

import { FormStep } from "./FormStep";
import { ReviewStep } from "./ReviewStep";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { TransactionDetail, TransactionFee } from "@/domains/transaction/components/TransactionDetail";
import { SendRegistrationForm } from "@/domains/transaction/pages/SendRegistration/SendRegistration.contracts";
import { handleBroadcastError } from "@/domains/transaction/utils";
import { httpClient } from "@/app/services";
import {
	FORM_STEP,
	REVIEW_STEP,
} from "@/domains/transaction/components/SendRegistrationSidePanel/SendRegistrationSidePanel";

const component = ({
	activeTab,
	wallet,
	profile,
}: {
	activeTab: number;
	wallet?: Contracts.IReadWriteWallet;
	profile: Contracts.IProfile;
}) => (
	<Tabs activeId={activeTab}>
		<TabPanel tabId={FORM_STEP}>
			<FormStep wallet={wallet} profile={profile} />
		</TabPanel>
		<TabPanel tabId={REVIEW_STEP}>
			<ReviewStep wallet={wallet!} profile={profile} />
		</TabPanel>
	</Tabs>
);

const transactionDetails = ({
	transaction,
	translations,
	wallet,
}: {
	transaction: DTO.ExtendedSignedTransactionData;
	translations: any;
	wallet: Contracts.IReadWriteWallet;
}) => (
	<>
		<TransactionDetail label={translations("COMMON.USERNAME")}>{transaction.username()}</TransactionDetail>

		<TransactionFee currency={wallet.currency()} value={transaction.fee()} paddingPosition="top" />
	</>
);

component.displayName = "UsernameRegistrationForm";
transactionDetails.displayName = "UsernameRegistrationFormTransactionDetails";

export const UsernameRegistrationForm: SendRegistrationForm = {
	component,
	formFields: ["username"],
	tabSteps: 2,
	transactionDetails,
};

export const signUsernameRegistration = async ({ env, form, profile, signatory }: any) => {
	const { clearErrors, getValues } = form;

	clearErrors("mnemonic");
	const { network, senderAddress, username, gasLimit, gasPrice } = getValues();
	const senderWallet = profile.wallets().findByAddressWithNetwork(senderAddress, network.id());

	httpClient.forgetWalletCache(senderWallet);

	const transactionId = await senderWallet.transaction().signUsernameRegistration({
		data: {
			username,
		},
		gasLimit,
		gasPrice,
		signatory,
	});

	const response = await senderWallet.transaction().broadcast(transactionId);

	handleBroadcastError(response);

	await env.persist();

	return senderWallet.transaction().transaction(transactionId);
};
