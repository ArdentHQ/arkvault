import { Contracts } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { Dashboard } from "./Dashboard";
import * as useRandomNumberHook from "@/app/hooks/use-random-number";
import { translations as profileTranslations } from "@/domains/profile/i18n";
import * as usePortfolio from "@/domains/portfolio/hooks/use-portfolio";

import {
	env,
	render,
	screen,
	syncDelegates,
	waitFor,
	within,
	mockProfileWithPublicAndTestNetworks,
	getMainsailProfileId,
} from "@/utils/testing-library";

import { server, requestMock } from "@/tests/mocks/server";
import { BigNumber } from "@ardenthq/sdk-helpers";
import walletFixture from "@/tests/fixtures/coins/mainsail/devnet/wallets/0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6.json";

const history = createHashHistory();
let profile: Contracts.IProfile;
let resetProfileNetworksMock: () => void;

const fixtureProfileId = getMainsailProfileId();
let dashboardURL: string;
let mockTransactionsAggregate;

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

process.env.RESTORE_MAINSAIL_PROFILE = "true";
process.env.USE_MAINSAIL_NETWORK = "true";

describe("Dashboard", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(fixtureProfileId);

		await syncDelegates(profile);

		server.use(
			requestMock(
				"https://dwallets-evm.mainsailhq.com/api/wallets/0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
				walletFixture,
			),
		);

		const wallet = profile.wallets().first();

		await wallet.synchroniser().identity();

		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet, "isMultiSignature").mockReturnValue(false);

		vi.spyOn(usePortfolio, "usePortfolio").mockReturnValue({
			allWallets: [wallet],
			balance: {
				total: () => BigNumber.make("25"),
				totalConverted: () => BigNumber.make("45"),
			},
			selectedAddresses: [wallet.address()],
			selectedWallets: [wallet],
			setSelectedAddresses: () => {},
		});

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
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(10),
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it.skip("should show introductory tutorial", async () => {
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
	});
});
