/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import nock from "nock";
import React from "react";
import { Route } from "react-router-dom";

import { Dashboard } from "./Dashboard";
import * as useRandomNumberHook from "@/app/hooks/use-random-number";
import { translations as dashboardTranslations } from "@/domains/dashboard/i18n";
import { translations as profileTranslations } from "@/domains/profile/i18n";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	syncDelegates,
	useDefaultNetMocks,
	waitFor,
	within,
	mockNanoXTransport,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";

const history = createHashHistory();
let profile: Contracts.IProfile;
let resetProfileNetworksMock: () => void;

const fixtureProfileId = getDefaultProfileId();
let dashboardURL: string;

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
		await env.profiles().restore(profile);
		await profile.sync();

		const wallet = await profile.walletFactory().fromAddress({
			address: "AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX",
			coin: "ARK",
			network: "ark.mainnet",
		});
		profile.wallets().push(wallet);

		await syncDelegates(profile);

		vi.spyOn(useRandomNumberHook, "useRandomNumber").mockImplementation(() => 1);
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
			() => expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(4),
			{ timeout: 4000 },
		);

		await waitFor(() => {
			expect(screen.getByTestId("Balance__value")).toBeInTheDocument();
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should show introductory tutorial", async () => {
		const mockHasCompletedTutorial = vi.spyOn(profile, "hasCompletedIntroductoryTutorial").mockReturnValue(false);
		render(
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
			() => expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(4),
			{ timeout: 4000 },
		);

		expect(screen.getByText(profileTranslations.MODAL_WELCOME.STEP_1.TITLE)).toBeInTheDocument();

		mockHasCompletedTutorial.mockRestore();
	});

	it("should navigate to import ledger page", async () => {
		profile.markIntroductoryTutorialAsComplete();
		const ledgerTransportMock = mockNanoXTransport();

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

		await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(9));

		userEvent.click(screen.getByText(dashboardTranslations.WALLET_CONTROLS.IMPORT_LEDGER));

		await waitFor(() =>
			expect(history.location.pathname).toBe(`/profiles/${fixtureProfileId}/wallets/import/ledger`),
		);

		expect(asFragment()).toMatchSnapshot();

		ledgerTransportMock.mockRestore();
	});

	it("should navigate to create wallet page", async () => {
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
			() => expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(4),
			{ timeout: 5000 },
		);

		userEvent.click(screen.getByText("Create"));

		expect(history.location.pathname).toBe(`/profiles/${fixtureProfileId}/wallets/create`);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should navigate to import wallet page", async () => {
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
			() => expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(4),
			{ timeout: 5000 },
		);

		userEvent.click(screen.getByText("Import"));

		expect(history.location.pathname).toBe(`/profiles/${fixtureProfileId}/wallets/import`);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render loading state when profile is syncing", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<Dashboard />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(
			() => expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(8),
			{ timeout: 4000 },
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should display empty block when there are no transactions", async () => {
		const mockTransactionsAggregate = vi.spyOn(profile.transactionAggregate(), "all").mockResolvedValue({
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

	it("should open modal when click on a transaction", async () => {
		render(
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
			() => expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(4),
			{ timeout: 4000 },
		);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		userEvent.click(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")[0]);

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("Modal__close-button"));

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
	});
});
