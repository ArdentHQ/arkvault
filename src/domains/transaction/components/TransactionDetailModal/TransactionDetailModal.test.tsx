import { Contracts, ReadOnlyWallet } from "@/app/lib/profiles";
import React from "react";
import { requestMock, server } from "@/tests/mocks/server";
import { TransactionDetailModal } from "./TransactionDetailModal";
import { translations } from "@/domains/transaction/i18n";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { env, getDefaultProfileId, render, screen, syncValidators } from "@/utils/testing-library";

const fixtureProfileId = getDefaultProfileId();
let dashboardURL: string;

describe("TransactionDetailModal", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(async () => {
		dashboardURL = `/profiles/${fixtureProfileId}/dashboard`;
		profile = env.profiles().findById(getDefaultProfileId());

		await syncValidators(profile);

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();

		server.use(
			requestMock(
				`https://dwallets-evm.mainsailhq.com/api/blocks/*`,
				{ data: {} }, // Basic mock for block data
			),
		);
	});

	it("should not render if not open", () => {
		render(
			<TransactionDetailModal
				profile={profile}
				isOpen={false}
				transactionItem={{
					...TransactionFixture,
					blockHash: () => "as32d1as65d1as3d1as32d1asd51as3d21as3d2as165das",
					type: () => "transfer",
					wallet: () => wallet,
				}}
			/>,
		);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
	});

	it("should render a transfer modal", () => {
		render(
			<TransactionDetailModal
				profile={profile}
				isOpen={true}
				transactionItem={{
					...TransactionFixture,
					blockHash: () => "as32d1as65d1as3d1as32d1asd51as3d21as3d2as165das",
					isTransfer: () => true,
					memo: () => {},
					type: () => "transfer",
					wallet: () => wallet,
				}}
			/>,
			{
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_TRANSFER_DETAIL.TITLE);
	});

	it("should render a multi payment modal", () => {
		render(
			<TransactionDetailModal
				profile={profile}
				isOpen={true}
				transactionItem={{
					...TransactionFixture,
					blockHash: () => "as32d1as65d1as3d1as32d1asd51as3d21as3d2as165das",
					isMultiPayment: () => true,
					isTransfer: () => false,
					recipients: () => [
						{ address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD", amount: 1 },
						{ address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD", amount: 1 },
					],
					type: () => "multiPayment",
					wallet: () => wallet,
				}}
			/>,
			{
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_TRANSACTION_DETAILS.TITLE);
	});

	it.each(["vote", "unvote", "voteCombination"])("should render a %s modal", (transactionType) => {
		vi.spyOn(profile.validators(), "map").mockImplementation((wallet, votes) =>
			votes.map(
				(vote: string, index: number) =>
					// @ts-ignore
					new ReadOnlyWallet({
						address: vote,
						username: `validator-${index}`,
					}),
			),
		);

		render(
			<TransactionDetailModal
				profile={profile}
				isOpen={true}
				transactionItem={{
					...TransactionFixture,
					blockHash: () => "as32d1as65d1as3d1as32d1asd51as3d21as3d2as165das",
					data: () => ({
						data: {
							asset: {},
							blockHash: "as32d1as65d1as3d1as32d1asd51as3d21as3d2as165das",
						},
					}),
					isConfirmed: () => true,
					isUnvote: () => transactionType === "unvote",
					isVote: () => transactionType === "vote",
					isVoteCombination: () => transactionType === "voteCombination",
					type: () => transactionType,
					unvotes: () => {
						if (transactionType !== "vote") {
							return TransactionFixture.unvotes();
						}
						return [];
					},
					votes: () => {
						if (transactionType !== "unvote") {
							return TransactionFixture.votes();
						}
						return [];
					},
					wallet: () => wallet,
				}}
			/>,
			{
				route: dashboardURL,
			},
		);

		const labels = {
			unvote: "Unvote",
			vote: "Vote",
			voteCombination: "VoteOld",
		};

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(labels[transactionType]);
	});

	it("should render an vote swap modal for signed transaction", () => {
		vi.spyOn(profile.validators(), "map").mockImplementation((wallet, votes) =>
			votes.map(
				(vote: string, index: number) =>
					// @ts-ignore
					new ReadOnlyWallet({
						address: vote,
						username: `validator-${index}`,
					}),
			),
		);

		render(
			<TransactionDetailModal
				profile={profile}
				isOpen={true}
				transactionItem={{
					...TransactionFixture,
					blockHash: () => "as32d1as65d1as3d1as32d1asd51as3d21as3d2as165das",
					data: () => ({
						data: () => ({
							asset: {
								votes: ["+" + TransactionFixture.votes()[0], "-" + TransactionFixture.unvotes()[0]],
							},
							blockHash: "as32d1as65d1as3d1as32d1asd51as3d21as3d2as165das",
						}),
					}),
					isConfirmed: () => false,
					isUnvote: () => false,
					isVote: () => false,
					isVoteCombination: () => true,
					type: () => "swap",
					unvotes: () => TransactionFixture.unvotes(),
					votes: () => TransactionFixture.votes(),
					wallet: () => wallet,
				}}
			/>,
			{
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent("VoteOld");
	});

	it("should render a validator registration modal", () => {
		render(
			<TransactionDetailModal
				profile={profile}
				isOpen={true}
				transactionItem={{
					...TransactionFixture,
					blockHash: () => "as32d1as65d1as3d1as32d1asd51as3d21as3d2as165das",
					type: () => "validatorRegistration",
					username: () => "ARK Wallet",
					wallet: () => wallet,
				}}
			/>,
			{
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent("Registration");
	});

	it("should render a validator resignation modal", () => {
		render(
			<TransactionDetailModal
				profile={profile}
				isOpen={true}
				transactionItem={{
					...TransactionFixture,
					blockHash: () => "as32d1as65d1as3d1as32d1asd51as3d21as3d2as165das",
					type: () => "validatorResignation",
					wallet: () => wallet,
				}}
			/>,
			{
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent("Resignation");
	});
});
