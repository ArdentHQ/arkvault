/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";
import nock from "nock";
import React from "react";
import { Route } from "react-router-dom";

import { Dashboard } from "./Dashboard";
import * as useRandomNumberHook from "@/app/hooks/use-random-number";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	syncDelegates,
	useDefaultNetMocks,
	waitFor,
	within,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";

const history = createHashHistory();
let profile: Contracts.IProfile;
let resetProfileNetworksMock: () => void;

const fixtureProfileId = getDefaultProfileId();
let dashboardURL: string;

jest.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

describe("Dashboard", () => {
	beforeAll(async () => {
		useDefaultNetMocks();

		nock("https://ark-test.arkvault.io")
			.get("/api/transactions")
			.query(true)
			.reply(200, () => {
				const { meta, data } = require("tests/fixtures/coins/ark/devnet/transactions.json");
				return {
					data: data.slice(0, 2),
					meta,
				};
			})
			.persist();

		nock("https://neoscan.io/api/main_net/v1/")
			.get("/get_last_transactions_by_address/AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX/1")
			.reply(200, []);

		profile = env.profiles().findById(fixtureProfileId);

		const wallet = await profile.walletFactory().fromAddress({
			address: "AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX",
			coin: "ARK",
			network: "ark.mainnet",
		});

		profile.wallets().push(wallet);

		await syncDelegates(profile);

		await env.profiles().restore(profile);
		await profile.sync();

		useDefaultNetMocks();

		jest.spyOn(useRandomNumberHook, "useRandomNumber").mockImplementation(() => 1);
	});

	afterAll(() => {
		useRandomNumberHook.useRandomNumber.mockRestore();
	});

	beforeEach(() => {
		dashboardURL = `/profiles/${fixtureProfileId}/dashboard`;
		history.push(dashboardURL);

		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it("should render", async () => {
		const sent = await profile.transactionAggregate().all({ limit: 10 });
		const items = sent.items();

		const mockTransactionsAggregate = jest
			.spyOn(profile.transactionAggregate(), "all")
			.mockImplementation(() => Promise.resolve({ hasMorePages: () => false, items: () => items } as any));

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<Dashboard />
			</Route>,
			{
				history,
				route: dashboardURL,
				withProfileSynchronizer: true,
			},
		);

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(4),
		);

		await waitFor(() => {
			expect(screen.getByTestId("Balance__value")).toBeInTheDocument();
		});

		expect(asFragment()).toMatchSnapshot();

		mockTransactionsAggregate.mockRestore();
	});

	// it("should show introductory tutorial", async () => {
	// 	const mockHasCompletedTutorial = jest.spyOn(profile, "hasCompletedIntroductoryTutorial").mockReturnValue(false);
	// 	render(
	// 		<Route path="/profiles/:profileId/dashboard">
	// 			<Dashboard />
	// 		</Route>,
	// 		{
	// 			history,
	// 			route: dashboardURL,
	// 			withProfileSynchronizer: true,
	// 		},
	// 	);
	//
	// 	await waitFor(
	// 		() => expect(screen.getByText(profileTranslations.MODAL_WELCOME.STEP_1.TITLE)).toBeInTheDocument(),
	// 		{ timeout: 4000 },
	// 	);
	//
	// 	mockHasCompletedTutorial.mockRestore();
	// });

	// it("should render loading state when profile is syncing", async () => {
	// 	const { asFragment } = render(
	// 		<Route path="/profiles/:profileId/dashboard">
	// 			<Dashboard />
	// 		</Route>,
	// 		{
	// 			history,
	// 			route: dashboardURL,
	// 		},
	// 	);
	//
	// 	await waitFor(
	// 		() => expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(8),
	// 		{ timeout: 4000 },
	// 	);
	//
	// 	expect(asFragment()).toMatchSnapshot();
	// });
	//
	it("should display empty block when there are no transactions", async () => {
		const mockTransactionsAggregate = jest.spyOn(profile.transactionAggregate(), "all").mockResolvedValue({
			hasMorePages: () => false,
			items: () => [],
		} as any);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<Dashboard />
			</Route>,
			{
				history,
				route: dashboardURL,
				withProfileSynchronizer: true,
			},
		);

		await waitFor(
			() => expect(within(screen.getByTestId("TransactionTable")).getByRole("rowgroup")).toBeVisible(),
			{ timeout: 4000 },
		);

		await expect(screen.findByTestId("EmptyBlock")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		mockTransactionsAggregate.mockRestore();
	});

	// it("should open modal when click on a transaction", async () => {
	// 	render(
	// 		<Route path="/profiles/:profileId/dashboard">
	// 			<Dashboard />
	// 		</Route>,
	// 		{
	// 			history,
	// 			route: dashboardURL,
	// 			withProfileSynchronizer: true,
	// 		},
	// 	);
	//
	// 	await waitFor(
	// 		() => expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(4),
	// 		{ timeout: 4000 },
	// 	);
	//
	// 	expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
	//
	// 	userEvent.click(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")[0]);
	//
	// 	await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();
	//
	// 	userEvent.click(screen.getByTestId("Modal__close-button"));
	//
	// 	expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
	// });
});
