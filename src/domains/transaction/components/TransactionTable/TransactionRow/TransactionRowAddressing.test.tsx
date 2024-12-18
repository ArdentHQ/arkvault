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

		expect(screen.queryAllByTestId("TransactionRowAddressing__vote")).toHaveLength(1);

		const unvoteFixture = { ...fixture, isUnvote: () => true, isVote: () => false };
		render(<TransactionRowAddressing transaction={unvoteFixture as any} profile={profile} />);

		expect(screen.queryAllByTestId("TransactionRowAddressing__vote")).toHaveLength(2);
	});

	it("should render registration variant if transaction is delegate registration", () => {
		const registrationFixture = { ...fixture, isDelegateRegistration: () => true, username: () => "test" };
		render(<TransactionRowAddressing transaction={registrationFixture as any} profile={profile} />);

		expect(screen.getByTestId("TransactionRowAddressing__delegate_registration")).toBeInTheDocument();
	});

	it("should render resignation variant if transaction is delegate resignation", () => {
		const resignationFixture = {
			...fixture,
			isDelegateResignation: () => true,
			wallet: () => ({ ...TransactionFixture.wallet(), username: () => "test" }),
		};
		render(<TransactionRowAddressing transaction={resignationFixture as any} profile={profile} />);

		expect(screen.getByTestId("TransactionRowAddressing__delegate_resignation")).toBeInTheDocument();
	});

	it("should render as to-contract if transaction is musig registration", () => {
		const resignationFixture = {
			...fixture,
			isMultiSignatureRegistration: () => true,
		};
		render(<TransactionRowAddressing transaction={resignationFixture as any} profile={profile} />);

		expect(screen.getByTestId("TransactionRowAddressing__musig_registration")).toBeInTheDocument();
	});

	it("should render multipayment variant", () => {
		const multiPaymentFixture = { ...fixture, isMultiPayment: () => true };
		render(<TransactionRowAddressing transaction={multiPaymentFixture as any} profile={profile} />);

		expect(screen.getByTestId("TransactionRowAddressing__multipayment")).toBeTruthy();
	});

	it("should render label with the 'to' prefix if transaction is outgoing", () => {
		const sentFixture = { ...fixture, isSent: () => true, recipient: () => "DMFzWa3nHt9T1ChXdMwFrBZRTfKMjDyNss" };
		render(<TransactionRowAddressing transaction={sentFixture as any} profile={profile} />);

		expect(screen.getByTestId("TransactionRowAddressing__label")).toHaveTextContent("To");
	});

	it("should render label with the 'from' prefix if transaction is not outgoing", () => {
		const notSentFixture = {
			...fixture,
			isSent: () => false,
			recipient: () => "DMFzWa3nHt9T1ChXdMwFrBZRTfKMjDyNss",
		};
		render(<TransactionRowAddressing transaction={notSentFixture as any} profile={profile} />);

		expect(screen.getByTestId("TransactionRowAddressing__label")).toHaveTextContent("From");
	});

	it("should expand width of address container if the wallet has alias", () => {
		const aliasFixture = { ...fixture, sender: () => "D61mfSggzbvQgTUe6JhYKH2doHaqJ3Dyib" };

		render(<TransactionRowAddressing transaction={aliasFixture as any} profile={profile} />);

		expect(screen.getByTestId("TransactionRowAddressing__address-container")).toHaveClass(
			"w-40 sm:w-40 md:w-32 lg:w-50",
		);
	});

	it("should render label with the 'Return' prefix if transaction is sent to address itself", () => {
		const returnFixture = { ...fixture, isReturn: () => true };
		render(<TransactionRowAddressing transaction={returnFixture as any} profile={profile} />);

		expect(screen.getByTestId("TransactionRowAddressing__label")).toHaveTextContent("Return");
	});

	it("should not expand width of address container if the wallet has no alias", () => {
		render(<TransactionRowAddressing transaction={fixture as any} profile={profile} />);

		expect(screen.getByTestId("TransactionRowAddressing__address-container")).not.toHaveClass("w-30");
	});
});
