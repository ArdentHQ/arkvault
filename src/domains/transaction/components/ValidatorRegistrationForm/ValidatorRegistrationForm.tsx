import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";

import { FormStep } from "./FormStep";
import { ReviewStep } from "./ReviewStep";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { TransactionDetail, TransactionFee } from "@/domains/transaction/components/TransactionDetail";
import { SendRegistrationForm } from "@/domains/transaction/pages/SendRegistration/SendRegistration.contracts";
import { handleBroadcastError } from "@/domains/transaction/utils";

const component = ({
	activeTab,
	wallet,
	profile,
}: {
	activeTab: number;
	wallet: Contracts.IReadWriteWallet;
	profile: Contracts.IProfile;
}) => (
	<Tabs activeId={activeTab}>
		<TabPanel tabId={1}>
			<FormStep wallet={wallet} profile={profile} />
		</TabPanel>
		<TabPanel tabId={2}>
			<ReviewStep wallet={wallet} profile={profile} />
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
		<TransactionDetail label={translations("TRANSACTION.VALIDATOR_PUBLIC_KEY")}>
			{transaction.data().data().asset.validatorPublicKey as string}
		</TransactionDetail>

		<TransactionFee currency={wallet.currency()} value={transaction.fee()} paddingPosition="top" />
	</>
);

component.displayName = "ValidatorRegistrationForm";
transactionDetails.displayName = "ValidatorRegistrationFormTransactionDetails";

export const ValidatorRegistrationForm: SendRegistrationForm = {
	component,
	formFields: ["validatorPublicKey"],
	tabSteps: 2,
	transactionDetails,
};

export const signValidatorRegistration = async ({ env, form, profile, signatory }: any) => {
	const { clearErrors, getValues } = form;

	clearErrors("mnemonic");
	const { network, senderAddress, validatorPublicKey } = getValues();
	const senderWallet = profile.wallets().findByAddressWithNetwork(senderAddress, network.id());

	const transactionId = await senderWallet.transaction().signValidatorRegistration({
		data: {
			validatorPublicKey,
		},
		// @TODO: Remove hardcoded fee once fees are implemented for evm.
		fee: 5,
		signatory,
	});

	const response = await senderWallet.transaction().broadcast(transactionId);

	handleBroadcastError(response);

	await env.persist();

	return senderWallet.transaction().transaction(transactionId);
};
