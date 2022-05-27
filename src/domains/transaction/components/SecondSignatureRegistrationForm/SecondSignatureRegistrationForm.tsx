import { Contracts, DTO } from "@payvo/sdk-profiles";
import React from "react";

import { BackupStep } from "./BackupStep";
import { GenerationStep } from "./GenerationStep";
import { ReviewStep } from "./ReviewStep";
import { VerificationStep } from "./VerificationStep";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { TransactionFee } from "@/domains/transaction/components/TransactionDetail";
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
			<GenerationStep wallet={wallet} profile={profile} />
		</TabPanel>

		<TabPanel tabId={2}>
			<BackupStep />
		</TabPanel>

		<TabPanel tabId={3}>
			<VerificationStep />
		</TabPanel>

		<TabPanel tabId={4}>
			<ReviewStep wallet={wallet} />
		</TabPanel>
	</Tabs>
);

const transactionDetails = ({
	transaction,
	wallet,
}: {
	transaction: DTO.ExtendedSignedTransactionData;
	wallet: Contracts.IReadWriteWallet;
}) => <TransactionFee currency={wallet.currency()} value={transaction.fee()} paddingPosition="top" />;

component.displayName = "SecondSignatureRegistrationForm";
transactionDetails.displayName = "SecondSignatureRegistrationFormTransactionDetails";

export const SecondSignatureRegistrationForm: SendRegistrationForm = {
	component,
	formFields: ["secondMnemonic", "verification"],
	tabSteps: 4,
	transactionDetails,
};

export const signSecondSignatureRegistration = async ({ env, form, profile, signatory }: any) => {
	const { clearErrors, getValues } = form;

	clearErrors("mnemonic");
	const { encryptionPassword, fee, network, senderAddress, secondMnemonic } = getValues();
	const senderWallet = profile.wallets().findByAddressWithNetwork(senderAddress, network.id());

	const transactionId = await senderWallet.transaction().signSecondSignature({
		data: {
			mnemonic: secondMnemonic,
		},
		fee: +fee,
		signatory,
	});

	const response = await senderWallet.transaction().broadcast(transactionId);

	handleBroadcastError(response);

	if (senderWallet.usesPassword()) {
		await senderWallet.mutator().removeEncryption(encryptionPassword);
	}

	await env.persist();

	return senderWallet.transaction().transaction(transactionId);
};
