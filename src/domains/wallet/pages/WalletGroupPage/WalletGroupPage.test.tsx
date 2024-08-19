import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";
import { Context as ResponsiveContext } from "react-responsive";
import { WalletGroupPage } from "./WalletGroupPage";
import { env, getDefaultProfileId, render, screen, syncDelegates } from "@/utils/testing-library";
import * as envHooks from "@/app/hooks/env";
import * as useDisplayWallets from "@/domains/wallet/hooks/use-display-wallets";
import { UseDisplayWallets } from "@/domains/wallet/hooks/use-display-wallets.contracts";
import { server, requestMock } from "@/tests/mocks/server";

const history = createHashHistory();

describe("WalletGroupPage", () => {
	let profile: Contracts.IProfile;
	let wallets: Contracts.IReadWriteWallet[];
	let network: Networks.Network;

	let duplicateWallets: Contracts.IReadWriteWallet[];

	let useDisplayWalletsResult: Partial<ReturnType<UseDisplayWallets>>;
	let useDisplayWalletsSpy: vi.SpyInstance;

	let walletGroupURL: string;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		wallets = profile.wallets().valuesWithCoin();
		network = wallets[0].network();

		walletGroupURL = `/profiles/${profile.id()}/network/${network.id()}`;

		duplicateWallets = [];
		for (const _ of Array.from({ length: 16 })) {
			duplicateWallets.push(wallets[0]);
		}

		wallets = profile.wallets().values();

		await profile.sync();
		await syncDelegates(profile);

		history.push(walletGroupURL);

		vi.spyOn(envHooks, "useActiveProfile").mockReturnValue(profile);
	});

	beforeEach(() => {
		history.push(walletGroupURL);

		useDisplayWalletsResult = {
			availableNetworks: [wallets[0].network()],
			walletsGroupedByNetwork: new Map(),
		};
		useDisplayWalletsResult.walletsGroupedByNetwork?.set(wallets[0].network(), duplicateWallets);

		useDisplayWalletsSpy = vi.spyOn(useDisplayWallets, "useDisplayWallets").mockReturnValue({
			...useDisplayWalletsResult,
			availableWallets: duplicateWallets,
		} as ReturnType<UseDisplayWallets>);

		server.use(requestMock("https://ark-test-musig.arkvault.io", undefined, { method: "post" }));
	});

	afterEach(() => {
		useDisplayWalletsSpy.mockRestore();
	});

	it("should render page", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/network/:networkId">
				<WalletGroupPage />
			</Route>,
			{
				history,
				route: walletGroupURL,
			},
		);

		expect(screen.getByTestId("WalletsGroupHeader")).toBeInTheDocument();
		expect(screen.queryByTestId("Accordion__toggle")).not.toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();
	});

	it("should paginate", async () => {
		render(
			<Route path="/profiles/:profileId/network/:networkId">
				<ResponsiveContext.Provider value={{ width: 1024 }}>
					<WalletGroupPage />
				</ResponsiveContext.Provider>
			</Route>,
			{
				history,
				route: walletGroupURL,
			},
		);

		expect(screen.getByTestId("Pagination")).toBeInTheDocument();
		expect(screen.getByTestId("Pagination__next")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("Pagination__next"));

		expect(screen.getAllByTestId("TableRow")).toHaveLength(1);
	});

	it("should go to main page if no network", () => {
		history.push(`/profiles/${profile.id()}/network/undefined`);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/network/:networkId">
				<WalletGroupPage />
			</Route>,
			{
				history,
				route: `/profiles/${profile.id()}/network/undefined`,
			},
		);

		expect(history.location.pathname).toBe("/");

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render empty list if no wallets", () => {
		useDisplayWalletsResult.walletsGroupedByNetwork = new Map();

		const { asFragment } = render(
			<Route path="/profiles/:profileId/network/:networkId">
				<WalletGroupPage />
			</Route>,
			{
				history,
				route: walletGroupURL,
			},
		);

		expect(asFragment()).toMatchSnapshot();
	});
});
