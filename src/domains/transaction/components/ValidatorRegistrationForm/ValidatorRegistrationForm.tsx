import { Contracts, DTO } from "@/app/lib/profiles";
import React from "react";

import { FormStep } from "./FormStep";
import { ReviewStep } from "./ReviewStep";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { TransactionDetail, TransactionFee } from "@/domains/transaction/components/TransactionDetail";
import { SendRegistrationForm } from "@/domains/transaction/pages/SendRegistration/SendRegistration.contracts";
import { handleBroadcastError } from "@/domains/transaction/utils";
import { httpClient } from "@/app/services";

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
		<TabPanel tabId={1}>
			<FormStep wallet={wallet} profile={profile} />
		</TabPanel>
		<TabPanel tabId={2}>
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
		<TransactionDetail label={translations("TRANSACTION.VALIDATOR_PUBLIC_KEY")}>
			{transaction.validatorPublicKey()}
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
	const { network, senderAddress, validatorPublicKey, gasPrice, gasLimit } = getValues();
	const senderWallet = profile.wallets().findByAddressWithNetwork(senderAddress, network.id());

	httpClient.forgetWalletCache(senderWallet);

	let transactionId;

	if (senderWallet.isValidator()) {
		transactionId = await senderWallet.transaction().signUpdateValidator({
			data: {
				validatorPublicKey,
			},
			gasLimit,
			gasPrice,
			signatory,
		});
	} else {
		transactionId = await senderWallet.transaction().signValidatorRegistration({
			data: {
				validatorPublicKey,
				value: profile.activeNetwork().milestone()["validatorRegistrationFee"] ?? 0,
			},
			gasLimit,
			gasPrice,
			signatory,
		});
	}

	const response = await senderWallet.transaction().broadcast(transactionId);

	handleBroadcastError(response);

	await env.persist();

	return senderWallet.transaction().transaction(transactionId);
};
