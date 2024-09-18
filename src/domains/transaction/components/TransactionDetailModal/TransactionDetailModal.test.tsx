import { Contracts, ReadOnlyWallet } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { TransactionDetailModal } from "./TransactionDetailModal";
import { translations } from "@/domains/transaction/i18n";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { env, getDefaultProfileId, render, screen, syncDelegates, waitFor } from "@/utils/testing-library";

const history = createHashHistory();

const fixtureProfileId = getDefaultProfileId();
let dashboardURL: string;

describe("TransactionDetailModal", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(async () => {
		dashboardURL = `/profiles/${fixtureProfileId}/dashboard`;
		history.push(dashboardURL);
		profile = env.profiles().findById(getDefaultProfileId());

		await syncDelegates(profile);

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();
	});

	it("should not render if not open", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionDetailModal
					isOpen={false}
					transactionItem={{
						...TransactionFixture,
						blockId: () => "as32d1as65d1as3d1as32d1asd51as3d21as3d2as165das",
						type: () => "transfer",
						wallet: () => wallet,
					}}
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a transfer modal", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionDetailModal
					isOpen={true}
					transactionItem={{
						...TransactionFixture,
						blockId: () => "as32d1as65d1as3d1as32d1asd51as3d21as3d2as165das",
						type: () => "transfer",
						wallet: () => wallet,
					}}
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_TRANSFER_DETAIL.TITLE);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a multi signature modal", async () => {
		await profile.wallets().restore();

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionDetailModal
					isOpen={true}
					transactionItem={{
						...TransactionFixture,
						blockId: () => "as32d1as65d1as3d1as32d1asd51as3d21as3d2as165das",
						min: () => 2,
						publicKeys: () => [wallet.publicKey(), profile.wallets().last().publicKey()],
						type: () => "multiSignature",
						wallet: () => wallet,
					}}
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(
				translations.MODAL_MULTISIGNATURE_DETAIL.STEP_1.TITLE,
			),
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a multi payment modal", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionDetailModal
					isOpen={true}
					transactionItem={{
						...TransactionFixture,
						blockId: () => "as32d1as65d1as3d1as32d1asd51as3d21as3d2as165das",
						isMultiPayment: () => true,
						isTransfer: () => false,
						recipients: () => [
							{ address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD", amount: 1 },
							{ address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD", amount: 1 },
						],
						type: () => "multiPayment",
						wallet: () => wallet,
					}}
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_TRANSACTION_DETAILS.TITLE);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a ipfs modal", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionDetailModal
					isOpen={true}
					transactionItem={{
						...TransactionFixture,
						data: () => ({
							data: {
								asset: { ipfs: "as32d1as65d1as3d1as32d1asd51as3d21as3d2as165das" },
								blockId: "as32d1as65d1as3d1as32d1asd51as3d21as3d2as165das",
							},
						}),
						type: () => "ipfs",
						wallet: () => wallet,
					}}
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent("IPFS");
		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["unvote", "vote", "voteCombination"])("should render a %s modal", (transactionType) => {
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

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionDetailModal
					isOpen={true}
					transactionItem={{
						...TransactionFixture,
						blockId: () => "as32d1as65d1as3d1as32d1asd51as3d21as3d2as165das",
						data: () => {},
						data: () => ({
							data: {
								asset: {},
								blockId: "as32d1as65d1as3d1as32d1asd51as3d21as3d2as165das",
							},
						}),
						type: () => transactionType,
						wallet: () => wallet,
					}}
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		const labels = {
			unvote: "Unvote",
			vote: "Vote",
			voteCombination: "Vote Swap",
		};

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(labels[transactionType]);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a delegate registration modal", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionDetailModal
					isOpen={true}
					transactionItem={{
						...TransactionFixture,
						blockId: () => "as32d1as65d1as3d1as32d1asd51as3d21as3d2as165das",
						type: () => "delegateRegistration",
						username: () => "ARK Wallet",
						wallet: () => wallet,
					}}
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(
			translations.MODAL_DELEGATE_REGISTRATION_DETAIL.TITLE,
		);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a delegate resignation modal", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionDetailModal
					isOpen={true}
					transactionItem={{
						...TransactionFixture,
						blockId: () => "as32d1as65d1as3d1as32d1asd51as3d21as3d2as165das",
						type: () => "delegateResignation",
						wallet: () => ({
							...TransactionFixture.wallet(),
							network: () => wallet.network(),
							username: () => "ARK Wallet",
						}),
					}}
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(
			translations.MODAL_DELEGATE_RESIGNATION_DETAIL.TITLE,
		);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a second signature modal", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionDetailModal
					isOpen={true}
					transactionItem={{
						...TransactionFixture,
						blockId: () => "as32d1as65d1as3d1as32d1asd51as3d21as3d2as165das",
						type: () => "secondSignature",
						wallet: () => wallet,
					}}
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SECOND_SIGNATURE_DETAIL.TITLE);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a magistrate modal", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionDetailModal
					isOpen={true}
					transactionItem={{
						...TransactionFixture,
						blockId: () => "as32d1as65d1as3d1as32d1asd51as3d21as3d2as165das",
						isMagistrate: () => true,
						isTransfer: () => false,
						type: () => "magistrate",
						wallet: () => wallet,
					}}
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render an unlock tokens modal", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TransactionDetailModal
					isOpen={true}
					transactionItem={{
						...TransactionFixture,
						isTransfer: () => false,
						isUnlockToken: () => true,
						type: () => "unlockToken",
						wallet: () => wallet,
					}}
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(asFragment()).toMatchSnapshot();
	});
});
