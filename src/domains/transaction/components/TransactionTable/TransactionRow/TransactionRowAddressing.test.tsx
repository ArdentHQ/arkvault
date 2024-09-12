import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";
import { TransactionRowAddressing } from "./TransactionRowAddressing";
import { TransactionFixture } from "@/tests/fixtures/transactions";

describe("TransactionRowAddressing", () => {
	let profile: Contracts.IProfile;
	const fixture = {
		...TransactionFixture,
		wallet: () => ({ ...TransactionFixture.wallet(), currency: () => "DARK" }),
	};

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});
	it("should render", () => {
		render(<TransactionRowAddressing transaction={fixture as any} profile={profile} />);

		expect(screen.getByTestId("TransactionRowAddressing__container")).toBeTruthy();
	});

	it("should render vote variant if transaction is vote or unvote", () => {
		const voteFixture = { ...fixture, isVote: () => true };
		render(<TransactionRowAddressing transaction={voteFixture as any} profile={profile} />);

		expect(screen.getByTestId("TransactionRowAddressing__vote")).toBeTruthy();

		const unvoteFixture = { ...fixture, isUnvote: () => true, isVote: () => false };
		render(<TransactionRowAddressing transaction={unvoteFixture as any} profile={profile} />);
	});

	it("should render multipayment variant", () => {
		const multiPaymentFixture = { ...fixture, isMultiPayment: () => true };
		render(<TransactionRowAddressing transaction={multiPaymentFixture as any} profile={profile} />);

		expect(screen.getByTestId("TransactionRowAddressing__multipayment")).toBeTruthy();
	});

	it("should render the danger label if transaction is sent", () => {
		const sentFixture = { ...fixture, isSent: () => true };
		render(<TransactionRowAddressing transaction={sentFixture as any} profile={profile} />);

		expect(screen.getByTestId("TransactionRowAddressing__label")).toHaveTextContent("To");
	});

	it("should render the success label if transaction is not sent", () => {
		const notSentFixture = { ...fixture, isSent: () => false };
		render(<TransactionRowAddressing transaction={notSentFixture as any} profile={profile} />);

		expect(screen.getByTestId("TransactionRowAddressing__label")).toHaveTextContent("From");
	});

    it("should expand width of address container if the wallet has alias", () => {
        const aliasFixture = { ...fixture, sender: () => "D61mfSggzbvQgTUe6JhYKH2doHaqJ3Dyib" };

        render(<TransactionRowAddressing transaction={aliasFixture as any} profile={profile} />);

        expect(screen.getByTestId("TransactionRowAddressing__address-container")).toHaveClass("w-50");
    })

    it("should not expand width of address container if the wallet has no alias", () => {
        render(<TransactionRowAddressing transaction={fixture as any} profile={profile} />);

        expect(screen.getByTestId("TransactionRowAddressing__address-container")).not.toHaveClass("w-30");
    });
});
