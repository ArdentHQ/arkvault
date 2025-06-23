import React from "react";
import { Contracts } from "@/app/lib/profiles";
import { RecipientProperties } from "./SearchRecipient.contracts";
import { env, getDefaultProfileId, screen, render } from "@/utils/testing-library";
import { TransactionSummary } from "./TransactionSummary";
import { TransactionFixture } from "@/tests/fixtures/transactions";

describe("TransactionSummary", () => {
	let profile: Contracts.IProfile;

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	it("shows the validator fee if the transaction is a validator resignation and it has a validator fee", () => {
		const wallet = profile.wallets().first();

		const validatorFeeMock = vi.spyOn(wallet, "validatorFee").mockReturnValue(100);

		const transaction = {
			...TransactionFixture,
			isValidatorResignation: () => true,
		} as Contracts.SignedTransactionData;

		render(<TransactionSummary transaction={transaction} senderWallet={wallet} profile={profile} />);

		expect(screen.getByTestId("TransactionSummary__ValidatorFee")).toBeInTheDocument();

		validatorFeeMock.mockRestore();
	});

	it("does not shows the validator fee if the transaction is not a validator resignation", () => {
		const wallet = profile.wallets().first();

		const validatorFeeMock = vi.spyOn(wallet, "validatorFee").mockReturnValue(100);

		const transaction = {
			...TransactionFixture,
			isValidatorResignation: () => false,
		} as Contracts.SignedTransactionData;

		render(<TransactionSummary transaction={transaction} senderWallet={wallet} profile={profile} />);

		expect(screen.queryByTestId("TransactionSummary__ValidatorFee")).not.toBeInTheDocument();

		validatorFeeMock.mockRestore();
	});
});
