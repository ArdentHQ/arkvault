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

import { BigNumber } from "@ardenthq/sdk-helpers";

const history = createHashHistory();
let profile: Contracts.IProfile;
let resetProfileNetworksMock: () => void;

const fixtureProfileId = getMainsailProfileId();
let dashboardURL: string;
let mockTransactionsAggregate;

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

describe("Dashboard", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(fixtureProfileId);

		await syncDelegates(profile);

		const wallet = await profile.walletFactory().fromAddress({
			address: "0x659A76be283644AEc2003aa8ba26485047fd1BFB",
			coin: "Mainsail",
			network: "mainsail.devnet",
		});

		profile.wallets().push(wallet);

		// const wallet = profile.wallets().first()

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
