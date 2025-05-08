import { Contracts } from "@/app/lib/profiles";
import React from "react";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";
import { TransactionRowAddressing, TransactionRowLabel } from "./TransactionRowAddressing";
import { TransactionFixture } from "@/tests/fixtures/transactions";

describe("TransactionRowAddressing", () => {
	let profile: Contracts.IProfile;
	const fixture = {
		...TransactionFixture,
		wallet: () => ({
			...TransactionFixture.wallet(),
			coin: () => ({
				link: () => ({ wallet: () => ({ address: () => "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6" }) }),
			}),
			currency: () => "ARK",
		}),
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
		expect(screen.getByText("Contract")).toBeInTheDocument();

		const unvoteFixture = { ...fixture, isUnvote: () => true, isVote: () => false };
		render(<TransactionRowAddressing transaction={unvoteFixture as any} profile={profile} />);

		expect(screen.queryAllByTestId("TransactionRowAddressing__vote")).toHaveLength(2);
	});

	it("should render registration variant if transaction is validator registration", () => {
		const registrationFixture = { ...fixture, isValidatorRegistration: () => true, username: () => "test" };
		render(<TransactionRowAddressing transaction={registrationFixture as any} profile={profile} />);

		expect(screen.getByTestId("TransactionRowAddressing__vote")).toBeInTheDocument();
	});

	it("should render resignation variant if transaction is validator resignation", () => {
		const resignationFixture = {
			...fixture,
			isValidatorResignation: () => true,
			wallet: () => ({
				...TransactionFixture.wallet(),
				coin: () => ({
					link: () => ({ wallet: () => ({ address: () => "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6" }) }),
				}),
				username: () => "test",
			}),
		};
		render(<TransactionRowAddressing transaction={resignationFixture as any} profile={profile} />);

		expect(screen.getByTestId("TransactionRowAddressing__vote")).toBeInTheDocument();
	});

	it("should render multipayment variant", () => {
		const multiPaymentFixture = { ...fixture, isMultiPayment: () => true };
		render(<TransactionRowAddressing transaction={multiPaymentFixture as any} profile={profile} />);

		expect(screen.getByTestId("TransactionRowAddressing__multipayment")).toBeTruthy();
	});

	it("should render label with the 'to' prefix if transaction is outgoing", () => {
		const sentFixture = {
			...fixture,
			isSent: () => true,
			recipient: () => "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
		};
		render(<TransactionRowAddressing transaction={sentFixture as any} profile={profile} />);

		expect(screen.getByTestId("TransactionRowAddressing__label")).toHaveTextContent("To");
	});

	it("should render label with the 'from' prefix if transaction is not outgoing", () => {
		const notSentFixture = {
			...fixture,
			isSent: () => false,
			recipient: () => "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
		};
		render(<TransactionRowAddressing transaction={notSentFixture as any} profile={profile} />);

		expect(screen.getByTestId("TransactionRowAddressing__label")).toHaveTextContent("From");
	});

	it("should expand width of address container if the wallet has alias", () => {
		const aliasFixture = { ...fixture, sender: () => "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6" };

		render(<TransactionRowAddressing transaction={aliasFixture as any} profile={profile} />);

		expect(screen.getByTestId("TransactionRowAddressing__address-container")).toHaveClass("grow");
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

	it("should render advanced sender variant if the props isAdvanced is true and variant is start", () => {
		render(
			<TransactionRowAddressing
				transaction={fixture as any}
				profile={profile}
				isAdvanced={true}
				variant="sender"
			/>,
		);

		expect(screen.getByTestId("TransactionRowAddressing__container_advanced_sender")).toBeInTheDocument();
	});

	it("should render the sender address if the transaction is sent", () => {
		const sentFixture = {
			...fixture,
			from: () => "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
			isSent: () => true,
		};
		render(
			<TransactionRowAddressing
				transaction={sentFixture as any}
				profile={profile}
				isAdvanced={true}
				variant="sender"
			/>,
		);

		expect(screen.getByTestId("TransactionRowAddressing__container_advanced_sender")).toHaveTextContent(
			/Mainsail Wallet/,
		);
	});

	it("should render advanced recipient variant if the props isAdvanced is true and variant is recipient", () => {
		render(
			<TransactionRowAddressing
				transaction={fixture as any}
				profile={profile}
				isAdvanced={true}
				variant="recipient"
			/>,
		);

		expect(screen.getByTestId("TransactionRowAddressing__container_advanced_recipient")).toBeInTheDocument();
	});

	it("should render multipayment variant with return style if the variant is recipient and isAdvanced is true", () => {
		render(
			<TransactionRowAddressing transaction={fixture as any} profile={profile} isAdvanced variant="recipient" />,
		);

		expect(screen.getByTestId("TransactionRowAddressing__label")).toHaveClass("bg-theme-secondary-200");
		expect(screen.getByTestId("TransactionRowAddressing__label")).toHaveTextContent("To");
	});

	it("should render multipayment variant with default styles if isAdvanced is false", () => {
		render(<TransactionRowAddressing transaction={fixture as any} profile={profile} isAdvanced={false} />);

		expect(screen.getByTestId("TransactionRowAddressing__label")).not.toHaveClass("bg-theme-secondary-200");
		expect(screen.getByTestId("TransactionRowAddressing__label")).toHaveTextContent("To");
	});

	it("should set direction as 'return' when transaction isReturn is true", () => {
		const returnFixture = { ...fixture, isReturn: () => true };
		render(<TransactionRowAddressing transaction={returnFixture as any} profile={profile} />);

		expect(screen.getByTestId("TransactionRowAddressing__label")).toHaveTextContent("Return");
	});

	it("should render vote advanced variant if transaction is a contract transaction and isAdvanced is true", () => {
		const voteFixture = { ...fixture, isVote: () => true };
		render(
			<TransactionRowAddressing
				transaction={voteFixture as any}
				profile={profile}
				isAdvanced={true}
				variant="recipient"
			/>,
		);

		expect(screen.getByTestId("TransactionRowAddressing__vote_advanced_recipient")).toBeInTheDocument();
		expect(screen.getByText("Contract")).toBeInTheDocument();
	});
});

describe("TransactionRowLabel", () => {
	it("should render prioritizing style prop over direction prop", () => {
		render(<TransactionRowLabel direction="received" style="return" />);

		expect(screen.getByTestId("TransactionRowAddressing__label")).toHaveClass("bg-theme-secondary-200");
	});
});
