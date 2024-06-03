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
	onSelectedWallet,
	showWalletSelector,
}: {
	activeTab: number;
	wallet?: Contracts.IReadWriteWallet;
	profile: Contracts.IProfile;
	onSelectedWallet?: (wallet?: Contracts.IReadWriteWallet) => void;
	showWalletSelector?: boolean;
}) => (
	<Tabs activeId={activeTab}>
		<TabPanel tabId={1}>
			<FormStep
				wallet={wallet}
				profile={profile}
				onSelectedWallet={onSelectedWallet}
				showWalletSelector={showWalletSelector}
			/>
		</TabPanel>
		<TabPanel tabId={2}>
			{/* On review step you must have a wallet */}
			{/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
			<ReviewStep wallet={wallet!} />
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
}) => {
	const previousUsername = wallet.username();

	return (
		<>
			{previousUsername && (
				<TransactionDetail label={translations("TRANSACTION.OLD_USERNAME")}>
					{previousUsername}
				</TransactionDetail>
			)}

			<TransactionDetail
				label={
					previousUsername ? translations("TRANSACTION.NEW_USERNAME") : translations("TRANSACTION.USERNAME")
				}
			>
				{transaction.username()}
			</TransactionDetail>

			<TransactionFee currency={wallet.currency()} value={transaction.fee()} paddingPosition="top" />
		</>
	);
};

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
	const { fee, network, senderAddress, username } = getValues();
	const senderWallet = profile.wallets().findByAddressWithNetwork(senderAddress, network.id());

	const transactionId = await senderWallet.transaction().signUsernameRegistration({
		data: {
			username,
		},
		fee: +fee,
		signatory,
	});

	const response = await senderWallet.transaction().broadcast(transactionId);

	handleBroadcastError(response);

	await env.persist();

	return senderWallet.transaction().transaction(transactionId);
};
