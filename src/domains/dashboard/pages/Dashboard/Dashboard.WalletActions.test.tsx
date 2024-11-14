/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { Dashboard } from "./Dashboard";
import * as useRandomNumberHook from "@/app/hooks/use-random-number";
import { translations as dashboardTranslations } from "@/domains/dashboard/i18n";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	waitFor,
	mockNanoXTransport,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";

import { requestMock, server } from "@/tests/mocks/server";
import devnetTransactionsFixture from "@/tests/fixtures/coins/ark/devnet/transactions.json";
import mainnetTransactionsFixture from "@/tests/fixtures/coins/ark/mainnet/transactions.json";

const history = createHashHistory();
let profile: Contracts.IProfile;
let resetProfileNetworksMock: () => void;

const fixtureProfileId = getDefaultProfileId();
let dashboardURL: string;

describe("Dashboard", () => {
	beforeAll(async () => {
		server.use(
			requestMock("https://ark-test.arkvault.io/api/transactions", {
				data: devnetTransactionsFixture.data.slice(0, 2),
				meta: devnetTransactionsFixture.meta,
			}),
			requestMock("https://ark-live.arkvault.io/api/transactions", {
				data: [],
				meta: mainnetTransactionsFixture.meta,
			}),
		);

		profile = env.profiles().findById(fixtureProfileId);

		await env.profiles().restore(profile);
		await profile.sync();

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

	it("should navigate to import ledger page", async () => {
		profile.markIntroductoryTutorialAsComplete();
		const ledgerTransportMock = mockNanoXTransport();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<Dashboard />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(12));

		await userEvent.click(screen.getByText(dashboardTranslations.WALLET_CONTROLS.IMPORT_LEDGER));

		await waitFor(() =>
			expect(history.location.pathname).toBe(`/profiles/${fixtureProfileId}/wallets/import/ledger`),
		);

		ledgerTransportMock.mockRestore();
	});

	it("should navigate to create wallet page", async () => {
		render(
			<Route path="/profiles/:profileId/dashboard">
				<Dashboard />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(12));

		await userEvent.click(screen.getByText("Create"));

		expect(history.location.pathname).toBe(`/profiles/${fixtureProfileId}/wallets/create`);
	});

	it("should navigate to import wallet page", async () => {
		render(
			<Route path="/profiles/:profileId/dashboard">
				<Dashboard />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(12));

		await userEvent.click(screen.getByText("Import"));

		expect(history.location.pathname).toBe(`/profiles/${fixtureProfileId}/wallets/import`);
	});
});
