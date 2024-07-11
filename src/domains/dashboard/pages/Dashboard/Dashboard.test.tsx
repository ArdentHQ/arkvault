/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";
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
	waitFor,
	within,
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
let mockTransactionsAggregate;

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

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

		const wallet = await profile.walletFactory().fromAddress({
			address: "AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX",
			coin: "ARK",
			network: "ark.mainnet",
		});

		profile.wallets().push(wallet);

		await syncDelegates(profile);

		await env.profiles().restore(profile);
		await profile.sync();

		vi.spyOn(useRandomNumberHook, "useRandomNumber").mockImplementation(() => 1);

		const all = await profile.transactionAggregate().all({ limit: 10 });
		const transactions = all.items();

		mockTransactionsAggregate = vi
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

		mockTransactionsAggregate.mockRestore();
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

		await expect(screen.findByText(profileTranslations.MODAL_WELCOME.STEP_1.TITLE)).resolves.toBeVisible();

		mockHasCompletedTutorial.mockRestore();
		mockTransactionsAggregate.mockRestore();
	});
});
