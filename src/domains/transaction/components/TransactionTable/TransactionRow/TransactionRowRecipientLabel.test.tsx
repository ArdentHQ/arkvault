import { ReadOnlyWallet } from "@/app/lib/profiles";
import React from "react";

import { TransactionRowRecipientLabel } from "./TransactionRowRecipientLabel";
import { translations } from "@/domains/transaction/i18n";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { render, screen, renderResponsive } from "@/utils/testing-library";

describe("TransactionRowRecipientLabel", () => {
	it("should show address", () => {
		render(<TransactionRowRecipientLabel transaction={TransactionFixture} />);

		expect(screen.getByTestId("Address__address")).toHaveTextContent("0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6");
	});

	it("should show label", () => {
		render(
			<TransactionRowRecipientLabel
				transaction={{ ...TransactionFixture, type: () => "validatorRegistration" }}
			/>,
		);

		expect(screen.getByText(translations.TRANSACTION_TYPES.VALIDATOR_REGISTRATION)).toBeInTheDocument();
	});

	it("should show a multipayment label", () => {
		render(
			<TransactionRowRecipientLabel
				transaction={{
					...TransactionFixture,
					isMultiPayment: () => true,
					isTransfer: () => false,
					type: () => "multiPayment",
				}}
			/>,
		);

		expect(screen.getByText(translations.TRANSACTION_TYPES.MULTI_PAYMENT)).toBeInTheDocument();
	});

	it.each(["xs", "sm"])("should render with right alignment on mobile view", (breakpoint) => {
		renderResponsive(
			<TransactionRowRecipientLabel
				transaction={{
					...TransactionFixture,
					isTransfer: () => true,
				}}
			/>,
			breakpoint,
		);

		// eslint-disable-next-line testing-library/no-node-access
		expect(screen.getByTestId("Address__address").parentElement).toHaveClass("justify-end");
	});

	describe("Votes", () => {
		vi.spyOn(profile.validators(), "map").mockImplementation((wallet, votes) =>
			votes.map(
				(vote: string, index: number) =>
					// @ts-ignore
					new ReadOnlyWallet({
						address: vote,
						username: `delegate-${index}`,
					}),
			),
		);

		it("should show a vote label", () => {
			render(
				<TransactionRowRecipientLabel
					transaction={{
						...TransactionFixture,
						isTransfer: () => false,
						isVote: () => true,
						type: () => "vote",
						votes: () => ["+vote"],
					}}
				/>,
			);

			expect(screen.getByTestId("TransactionRowVoteLabel")).toHaveTextContent(
				translations.TRANSACTION_TYPES.VOTE,
			);
			expect(screen.getByTestId("TransactionRowVoteLabel")).toHaveTextContent("delegate-0");
		});

		it("should show a vote label with counter", () => {
			render(
				<TransactionRowRecipientLabel
					transaction={{
						...TransactionFixture,
						isTransfer: () => false,
						isVote: () => true,
						type: () => "vote",
						votes: () => ["+vote-1", "+vote-2"],
					}}
				/>,
			);

			expect(screen.getByTestId("TransactionRowVoteLabel")).toHaveTextContent(
				translations.TRANSACTION_TYPES.VOTE,
			);
			expect(screen.getByTestId("TransactionRowVoteLabel")).toHaveTextContent("delegate-0");
			expect(screen.getByTestId("TransactionRowVoteLabel")).toHaveTextContent("+1");
		});

		it("should show a unvote label", () => {
			render(
				<TransactionRowRecipientLabel
					transaction={{
						...TransactionFixture,
						isTransfer: () => false,
						isUnvote: () => true,
						type: () => "unvote",
						unvotes: () => ["-vote"],
					}}
				/>,
			);

			expect(screen.getByTestId("TransactionRowVoteLabel")).toHaveTextContent(
				translations.TRANSACTION_TYPES.UNVOTE,
			);
			expect(screen.getByTestId("TransactionRowVoteLabel")).toHaveTextContent("delegate-0");
		});

		it("should show a vote label with counter if there are multiple votes", () => {
			render(
				<TransactionRowRecipientLabel
					transaction={{
						...TransactionFixture,
						isTransfer: () => false,
						isUnvote: () => true,
						type: () => "unvote",
						unvotes: () => ["-vote", "-vote-2"],
					}}
				/>,
			);

			expect(screen.getByTestId("TransactionRowVoteLabel")).toHaveTextContent(
				translations.TRANSACTION_TYPES.UNVOTE,
			);
			expect(screen.getByTestId("TransactionRowVoteLabel")).toHaveTextContent("delegate-0");
			expect(screen.getByTestId("TransactionRowVoteLabel")).toHaveTextContent("+1");
		});

		it("should show a vote swap label", () => {
			render(
				<TransactionRowRecipientLabel
					transaction={{
						...TransactionFixture,
						isTransfer: () => false,
						isUnvote: () => true,
						isVote: () => true,
						isVoteCombination: () => true,
						type: () => "voteCombination",
						unvotes: () => ["-vote"],
						votes: () => ["-vote"],
					}}
				/>,
			);

			expect(screen.getByTestId("TransactionRowVoteCombinationLabel")).toHaveTextContent(
				translations.TRANSACTION_TYPES.VOTE_COMBINATION,
			);
		});

		it("should show a vote combination label with counter", () => {
			render(
				<TransactionRowRecipientLabel
					transaction={{
						...TransactionFixture,
						isTransfer: () => false,
						isUnvote: () => true,
						isVote: () => true,
						isVoteCombination: () => true,
						type: () => "voteCombination",
						unvotes: () => ["-vote-1", "-vote-2"],
						votes: () => ["+vote-1", "+vote-2"],
					}}
				/>,
			);

			expect(screen.getByTestId("TransactionRowVoteCombinationLabel")).toHaveTextContent(
				`${translations.TRANSACTION_TYPES.VOTE}2`,
			);
			expect(screen.getByTestId("TransactionRowVoteCombinationLabel")).toHaveTextContent(
				`${translations.TRANSACTION_TYPES.UNVOTE}2`,
			);
		});
	});
});
