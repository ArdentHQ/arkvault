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
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	useDefaultNetMocks,
	waitFor,
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

		profile = env.profiles().findById(fixtureProfileId);

		await env.profiles().restore(profile);
		await profile.sync();

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
			},
		);

		await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(9));

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
			},
		);

		await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(9));

		userEvent.click(screen.getByText("Import"));

		expect(history.location.pathname).toBe(`/profiles/${fixtureProfileId}/wallets/import`);
		expect(asFragment()).toMatchSnapshot();
	});
});
