import { ReadOnlyWallet } from "@ardenthq/sdk-profiles";
import React from "react";

import { TransactionRowRecipientLabel } from "./TransactionRowRecipientLabel";
import { translations } from "@/domains/transaction/i18n";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { env, render, screen, renderResponsive } from "@/utils/testing-library";

describe("TransactionRowRecipientLabel", () => {
	it("should show address", () => {
		render(<TransactionRowRecipientLabel transaction={TransactionFixture} />);

		expect(screen.getByTestId("Address__address")).toHaveTextContent("D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD");
	});

	it("should show label", () => {
		render(
			<TransactionRowRecipientLabel
				transaction={{ ...TransactionFixture, type: () => "delegateRegistration" }}
			/>,
		);

		expect(screen.getByText(translations.TRANSACTION_TYPES.DELEGATE_REGISTRATION)).toBeInTheDocument();
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

	it("should show a magistrate label", () => {
		render(
			<TransactionRowRecipientLabel
				transaction={{
					...TransactionFixture,
					type: () => "magistrate",
				}}
			/>,
		);

		expect(screen.getByText(translations.TRANSACTION_TYPES.MAGISTRATE)).toBeInTheDocument();
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
		vi.spyOn(env.delegates(), "map").mockImplementation((wallet, votes) =>
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
