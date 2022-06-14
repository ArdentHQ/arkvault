import { ReadOnlyWallet } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";
import nock from "nock";
import React from "react";
import { Route } from "react-router-dom";

import { VoteDetail } from "./VoteDetail";
import { translations } from "@/domains/transaction/i18n";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { env, getDefaultProfileId, render, screen, syncDelegates, waitFor } from "@/utils/testing-library";

const history = createHashHistory();

const fixtureProfileId = getDefaultProfileId();
let dashboardURL: string;

jest.setTimeout(10_000);

describe("VoteDetail", () => {
	beforeAll(async () => {
		nock.cleanAll();
		nock.disableNetConnect();

		nock("https://ark-test.arkvault.io")
			.get("/api/delegates")
			.query({ page: "1" })
			.reply(200, require("tests/fixtures/coins/ark/devnet/delegates.json"))
			.persist();

		const profile = env.profiles().findById(fixtureProfileId);

		await syncDelegates(profile);
	});

	beforeEach(() => {
		dashboardURL = `/profiles/${fixtureProfileId}/dashboard`;
		history.push(dashboardURL);

		jest.spyOn(env.delegates(), "map").mockImplementation((wallet, votes) =>
			votes.map(
				(vote: string, index: number) =>
					// @ts-ignore
					new ReadOnlyWallet({
						address: vote,
						username: `delegate-${index}`,
					}),
			),
		);
	});

	it("should not render if not open", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<VoteDetail isOpen={false} transaction={TransactionFixture} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a modal with votes", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<VoteDetail
					isOpen={true}
					transaction={{
						...TransactionFixture,
						unvotes: () => [],
						votes: () => ["034151a3ec46b5670a682b0a63394f863587d1bc97483b1b6c70eb58e7f0aed192"],
					}}
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_VOTE_DETAIL.TITLE),
		);

		await expect(screen.findByText("Vote")).resolves.toBeVisible();
		await expect(screen.findByText("delegate-0")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a modal with unvotes", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<VoteDetail
					isOpen={true}
					transaction={{
						...TransactionFixture,
						unvotes: () => ["034151a3ec46b5670a682b0a63394f863587d1bc97483b1b6c70eb58e7f0aed192"],
						votes: () => [],
					}}
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_VOTE_DETAIL.TITLE),
		);

		await expect(screen.findByText("Unvote")).resolves.toBeVisible();
		await expect(screen.findByText("delegate-0")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a modal with votes and unvotes", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<VoteDetail
					isOpen={true}
					transaction={{
						...TransactionFixture,
						unvotes: () => ["034151a3ec46b5670a682b0a63394f863587d1bc97483b1b6c70eb58e7f0aed192"],
						votes: () => ["034151a3ec46b5670a682b0a63394f863587d1bc97483b1b6c70eb58e7f0aed192"],
					}}
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_VOTE_DETAIL.TITLE),
		);

		await expect(screen.findByText("Vote")).resolves.toBeVisible();
		await expect(screen.findByText("Unvote")).resolves.toBeVisible();

		await waitFor(() => expect(screen.getAllByText("delegate-0")).toHaveLength(2));

		expect(asFragment()).toMatchSnapshot();
	});
});
