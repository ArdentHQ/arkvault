/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";
import nock from "nock";
import React from "react";
import { Route } from "react-router-dom";

import { Dashboard } from "./Dashboard";
import * as useRandomNumberHook from "@/app/hooks/use-random-number";
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
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";

const history = createHashHistory();
let profile: Contracts.IProfile;
let resetProfileNetworksMock: () => void;

const fixtureProfileId = getDefaultProfileId();
let dashboardURL: string;
let mockTransactionsAggregate;

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

		const transactions = (await profile.transactionAggregate().all({ limit: 10 })).items();

		mockTransactionsAggregate = jest
			.spyOn(profile.transactionAggregate(), "all")
			.mockImplementation(() => Promise.resolve({ hasMorePages: () => false, items: () => transactions } as any));
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
		mockTransactionsAggregate.mockRestore();
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

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(4),
		);

		await waitFor(() => {
			expect(screen.getByTestId("Balance__value")).toBeInTheDocument();
		});

		expect(asFragment()).toMatchSnapshot();
		mockTransactionsAggregate.mockRestore();
	});

	it("should show introductory tutorial", async () => {
		const mockHasCompletedTutorial = jest.spyOn(profile, "hasCompletedIntroductoryTutorial").mockReturnValue(false);

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

		await waitFor(() =>
			expect(screen.getByText(profileTranslations.MODAL_WELCOME.STEP_1.TITLE)).toBeInTheDocument(),
		);

		mockHasCompletedTutorial.mockRestore();
		mockTransactionsAggregate.mockRestore();
	});
});
