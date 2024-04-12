import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { TransactionDetail, TransactionFee } from "@/domains/transaction/components/TransactionDetail";

import { FormStep } from "./FormStep";
import React from "react";
import { ReviewStep } from "./ReviewStep";
import { SendRegistrationForm } from "@/domains/transaction/pages/SendRegistration/SendRegistration.contracts";
import { handleBroadcastError } from "@/domains/transaction/utils";
import { isMainsailNetwork } from "@/utils/network-utils";

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
			<ReviewStep wallet={wallet} />
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
		{isMainsailNetwork(wallet.network()) && (
			<TransactionDetail label={translations("TRANSACTION.VALIDATOR_PUBLIC_KEY")}>
				{transaction.data().data().asset.validatorPublicKey as string}
			</TransactionDetail>
		)}

		{!isMainsailNetwork(wallet.network()) && (
			<TransactionDetail label={translations("TRANSACTION.DELEGATE_NAME")}>
				{transaction.username()}
			</TransactionDetail>
		)}

		<TransactionFee currency={wallet.currency()} value={transaction.fee()} paddingPosition="top" />
	</>
);

component.displayName = "DelegateRegistrationForm";
transactionDetails.displayName = "DelegateRegistrationFormTransactionDetails";

export const DelegateRegistrationForm: SendRegistrationForm = {
	component,
	formFields: ["username", "validatorPublicKey"],
	tabSteps: 2,
	transactionDetails,
};

export const signDelegateRegistration = async ({ env, form, profile, signatory }: any) => {
	const { clearErrors, getValues } = form;

	clearErrors("mnemonic");
	const { fee, network, senderAddress, username, validatorPublicKey } = getValues();
	const senderWallet = profile.wallets().findByAddressWithNetwork(senderAddress, network.id());

	const data = isMainsailNetwork(network) ? { validatorPublicKey } : { username };

	const transactionId = await senderWallet.transaction().signDelegateRegistration({
		data,
		fee: +fee,
		signatory,
	});

	const response = await senderWallet.transaction().broadcast(transactionId);

	handleBroadcastError(response);

	await env.persist();

	return senderWallet.transaction().transaction(transactionId);
};
