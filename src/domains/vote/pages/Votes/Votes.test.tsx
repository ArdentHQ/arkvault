/* eslint-disable @typescript-eslint/require-await */
import { Contracts, ReadOnlyWallet } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React, { useEffect } from "react";
import { Route } from "react-router-dom";

import { Votes } from "./Votes";
import { useProfileStatusWatcher } from "@/app/hooks";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	syncDelegates,
	waitFor,
	within,
	mockProfileWithPublicAndTestNetworks,
	mockProfileWithOnlyPublicNetworks,
} from "@/utils/testing-library";
import { useConfiguration } from "@/app/contexts";
import { server, requestMock } from "@/tests/mocks/server";

const history = createHashHistory();

let emptyProfile: Contracts.IProfile;
let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let blankWallet: Contracts.IReadWriteWallet;
let resetProfileNetworksMock: () => void;

const routePath = "/profiles/:profileId/votes";

const blankWalletPassphrase = "power return attend drink piece found tragic fire liar page disease combine";
const walletID = "ac38fe6d-4b67-4ef1-85be-17c5f6841129";

const Wrapper = ({ children }) => {
	const { setConfiguration } = useConfiguration();

	useEffect(() => {
		setConfiguration({ profileHasSyncedOnce: true, profileIsSyncingWallets: false });
	}, []);

	return children;
};

const renderPage = (route: string, routePath = "/profiles/:profileId/wallets/:walletId/votes", hasHistory = false) => {
	let routeOptions: any = {
		route: route,
	};

	if (hasHistory) {
		history.push(route);

		routeOptions = {
			...routeOptions,
			history,
		};
	}

	return render(
		<Route path={routePath}>
			<Wrapper>
				<Votes />
			</Wrapper>
		</Route>,
		routeOptions,
	);
};

const firstVoteButtonID = "DelegateRow__toggle-0";

describe("Votes", () => {
	beforeAll(async () => {
		emptyProfile = env.profiles().findById("cba050f1-880f-45f0-9af9-cfe48f406052");
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().findById(walletID);
		blankWallet = profile.wallets().push(
			await profile.walletFactory().fromMnemonicWithBIP39({
				coin: "ARK",
				mnemonic: blankWalletPassphrase,
				network: "ark.devnet",
			}),
		);

		wallet.settings().set(Contracts.WalletSetting.Alias, "Sample Wallet");

		await env.profiles().restore(profile);
		await syncDelegates(profile);
		await wallet.synchroniser().votes();
		await profile.sync();
	});

	beforeEach(() => {
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		server.use(
			requestMock(
				`https://ark-test.arkvault.io/api/wallets/${blankWallet.address()}`,
				{
					error: "Not Found",
					message: "Wallet not found",
					statusCode: 404,
				},
				{ status: 404 },
			),
		);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it("should render", async () => {
		const route = `/profiles/${profile.id()}/wallets/${wallet.id()}/votes`;
		const { asFragment, container } = renderPage(route);

		expect(container).toBeInTheDocument();
		expect(screen.getByTestId("DelegateTable")).toBeInTheDocument();

		await expect(screen.findByTestId(firstVoteButtonID)).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render and handle wallet current voting exception", async () => {
		const currentWallet = profile.wallets().findById(walletID);
		const currentMock = vi.spyOn(currentWallet.voting(), "current").mockImplementation(() => {
			throw new Error("Error");
		});

		const route = `/profiles/${profile.id()}/wallets/${wallet.id()}/votes`;
		const { asFragment, container } = renderPage(route);

		expect(container).toBeInTheDocument();
		expect(screen.getByTestId("DelegateTable")).toBeInTheDocument();

		await expect(screen.findByTestId(firstVoteButtonID)).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		currentMock.mockRestore();
	});

	it("should render with no wallets", () => {
		const route = `/profiles/${emptyProfile.id()}/votes`;
		const { asFragment, container } = renderPage(route, routePath);

		expect(container).toBeInTheDocument();
		expect(screen.getByTestId("EmptyBlock")).toBeInTheDocument();
		expect(screen.queryByTestId("HeaderSearchBar__button")).not.toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should toggle network selection from network filters", async () => {
		const route = `/profiles/${profile.id()}/votes`;
		const { asFragment, container } = renderPage(route, routePath);

		expect(container).toBeInTheDocument();
		expect(screen.getByTestId("AddressTable")).toBeInTheDocument();

		await expect(screen.findByTestId("AddressRow__select-0")).resolves.toBeVisible();

		await userEvent.click(within(screen.getByTestId("Votes__FilterWallets")).getByTestId("dropdown__toggle"));

		const toggle = screen.getByTestId("NetworkOption__ark.devnet");

		await waitFor(() => expect(toggle).toBeInTheDocument());
		await userEvent.click(toggle);

		expect(screen.queryByTestId("AddressTable")).not.toBeInTheDocument();

		await waitFor(() => expect(toggle).toBeInTheDocument());
		await userEvent.click(toggle);

		await expect(screen.findByTestId("AddressTable")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render network selection with sorted network filters", async () => {
		const profile = await env.profiles().create("test");
		await env.profiles().restore(profile);

		const resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		const { wallet: arkWallet } = await profile.walletFactory().generate({
			coin: "ARK",
			network: "ark.devnet",
		});
		profile.wallets().push(arkWallet);
		await env.wallets().syncByProfile(profile);

		const route = `/profiles/${profile.id()}/votes`;
		renderPage(route, routePath);

		expect(screen.getAllByTestId("AddressTable")).toHaveLength(1);

		await userEvent.click(within(screen.getByTestId("Votes__FilterWallets")).getByTestId("dropdown__toggle"));

		expect(screen.getByTestId("NetworkOptions")).toBeInTheDocument();

		// eslint-disable-next-line testing-library/no-node-access
		expect(screen.getByTestId("NetworkOption__ark.devnet").querySelector("svg#ark")).toBeInTheDocument();

		resetProfileNetworksMock();
	});

	it("should select starred option in the wallets display type", async () => {
		const route = `/profiles/${profile.id()}/votes`;
		const { asFragment, container } = renderPage(route, routePath);

		expect(container).toBeInTheDocument();
		expect(screen.getByTestId("AddressTable")).toBeInTheDocument();

		await expect(screen.findByTestId("AddressRow__select-0")).resolves.toBeVisible();

		await userEvent.click(within(screen.getByTestId("Votes__FilterWallets")).getByTestId("dropdown__toggle"));

		await waitFor(() =>
			expect(within(screen.getByTestId("FilterWallets")).getByTestId("dropdown__toggle")).toBeInTheDocument(),
		);

		const toggle = within(screen.getByTestId("FilterWallets")).getByTestId("dropdown__toggle");
		await userEvent.click(toggle);

		await expect(screen.findByTestId("filter-wallets__wallets")).resolves.toBeVisible();

		await expect(screen.findByTestId("dropdown__option--1")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("dropdown__option--1"));

		expect(screen.queryByTestId("AddressTable")).not.toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should select ledger option in the wallets display type", async () => {
		const route = `/profiles/${profile.id()}/votes`;
		const { asFragment, container } = renderPage(route, routePath);

		expect(container).toBeInTheDocument();
		expect(screen.getByTestId("AddressTable")).toBeInTheDocument();

		await expect(screen.findByTestId("AddressRow__select-0")).resolves.toBeVisible();

		await userEvent.click(within(screen.getByTestId("Votes__FilterWallets")).getByTestId("dropdown__toggle"));

		await waitFor(() =>
			expect(within(screen.getByTestId("FilterWallets")).getByTestId("dropdown__toggle")).toBeInTheDocument(),
		);

		const toggle = within(screen.getByTestId("FilterWallets")).getByTestId("dropdown__toggle");
		await userEvent.click(toggle);

		await expect(screen.findByTestId("filter-wallets__wallets")).resolves.toBeVisible();

		await expect(screen.findByTestId("dropdown__option--2")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("dropdown__option--2"));

		expect(screen.queryByTestId("AddressTable")).not.toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should filter current delegates", async () => {
		const currentWallet = profile.wallets().findById(walletID);
		vi.spyOn(currentWallet.voting(), "current").mockReturnValue([
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					address: "D5L5zXgvqtg7qoGimt5vYhFuf5Ued6iWVr",
					explorerLink: "",
					governanceIdentifier: "address",
					isDelegate: true,
					isResignedDelegate: false,
					publicKey: currentWallet.publicKey(),
					rank: 52,
					username: "arkx",
				}),
			},
		]);

		const route = `/profiles/${profile.id()}/wallets/${wallet.id()}/votes`;
		const { asFragment, container } = renderPage(route);

		expect(container).toBeInTheDocument();
		expect(screen.getByTestId("DelegateTable")).toBeInTheDocument();

		await expect(screen.findByTestId(firstVoteButtonID)).resolves.toBeVisible();

		await userEvent.click(within(screen.getByTestId("VotesFilter")).getByTestId("dropdown__toggle"));

		await waitFor(() =>
			expect(within(screen.getByTestId("VotesFilter")).getByTestId("dropdown__content")).toBeInTheDocument(),
		);

		await userEvent.click(screen.getByTestId("VotesFilter__option--current"));

		await waitFor(() => expect(screen.getAllByTestId(firstVoteButtonID)).toHaveLength(1));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should navigate to create create page", async () => {
		const route = `/profiles/${emptyProfile.id()}/votes`;
		const { asFragment } = renderPage(route, routePath, true);

		expect(screen.getByTestId("EmptyBlock")).toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: /Create/ }));

		expect(history.location.pathname).toBe(`/profiles/${emptyProfile.id()}/wallets/create`);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should navigate to import wallet page", async () => {
		const route = `/profiles/${emptyProfile.id()}/votes`;
		const { asFragment } = renderPage(route, routePath, true);

		expect(screen.getByTestId("EmptyBlock")).toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: /Import/ }));

		expect(history.location.pathname).toBe(`/profiles/${emptyProfile.id()}/wallets/import`);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should select an address and delegate", async () => {
		const currentWallet = profile.wallets().findById(walletID);
		vi.spyOn(currentWallet.voting(), "current").mockReturnValue([
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					address: "D5L5zXgvqtg7qoGimt5vYhFuf5Ued6iWVr",
					explorerLink: "",
					governanceIdentifier: "address",
					isDelegate: true,
					isResignedDelegate: false,
					publicKey: currentWallet.publicKey(),
					rank: 52,
					username: "arkx",
				}),
			},
		]);

		const route = `/profiles/${profile.id()}/votes`;
		const { asFragment } = renderPage(route, routePath);

		expect(screen.getByTestId("AddressTable")).toBeInTheDocument();

		await expect(screen.findByTestId("StatusIcon__icon")).resolves.toBeVisible();

		const selectAddressButton = screen.getByTestId("AddressRow__select-1");

		await userEvent.click(selectAddressButton);

		expect(screen.getByTestId("DelegateTable")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByTestId(firstVoteButtonID)).toBeInTheDocument();
		});

		const selectDelegateButton = screen.getByTestId(firstVoteButtonID);

		await userEvent.click(selectDelegateButton);

		expect(screen.getByTestId("DelegateTable__footer")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("DelegateTable__continue-button"));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should select an address without vote", async () => {
		const route = `/profiles/${profile.id()}/votes`;
		renderPage(route, routePath);

		expect(screen.getByTestId("AddressTable")).toBeInTheDocument();

		await expect(screen.findByTestId("StatusIcon__icon")).resolves.toBeVisible();

		const selectAddressButton = screen.getByTestId("AddressRow__select-1");

		await userEvent.click(selectAddressButton);

		await expect(screen.findByTestId("DelegateTable")).resolves.toBeVisible();
	});

	it("should select a delegate", async () => {
		const route = `/profiles/${profile.id()}/wallets/${wallet.id()}/votes`;
		const { asFragment } = renderPage(route);

		expect(screen.getByTestId("DelegateTable")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByTestId(firstVoteButtonID)).toBeInTheDocument();
		});

		const selectDelegateButton = screen.getByTestId(firstVoteButtonID);

		await userEvent.click(selectDelegateButton);

		expect(screen.getByTestId("DelegateTable__footer")).toBeInTheDocument();
		expect(screen.getByTestId("DelegateTable__footer--total")).toHaveTextContent("1/1");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should handle wallet vote error and show empty delegates", async () => {
		const route = `/profiles/${profile.id()}/wallets/${wallet.id()}/votes`;

		const walletVoteMock = vi.spyOn(wallet.voting(), "current").mockImplementation(() => {
			throw new Error("delegate error");
		});

		renderPage(route);

		expect(screen.getByTestId("DelegateTable")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByTestId(firstVoteButtonID)).toBeInTheDocument();
		});

		const selectDelegateButton = screen.getByTestId(firstVoteButtonID);

		await userEvent.click(selectDelegateButton);

		expect(screen.getByTestId("DelegateTable__footer")).toBeInTheDocument();
		expect(screen.getByTestId("DelegateTable__footer--total")).toHaveTextContent("1/1");

		walletVoteMock.mockRestore();
	});

	it("should handle resigned delegate and show empty results", async () => {
		const currentWallet = profile.wallets().findById(walletID);
		vi.spyOn(currentWallet.voting(), "current").mockReturnValue([
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					address: "D5L5zXgvqtg7qoGimt5vYhFuf5Ued6iWVr",
					explorerLink: "",
					governanceIdentifier: "address",
					isDelegate: true,
					isResignedDelegate: true,
					publicKey: currentWallet.publicKey(),
					rank: 52,
					username: "arkx",
				}),
			},
		]);

		const route = `/profiles/${profile.id()}/wallets/${wallet.id()}/votes`;
		renderPage(route);

		await expect(screen.findByTestId("DelegateTable")).resolves.toBeVisible();

		await expect(screen.findByTestId(firstVoteButtonID)).resolves.toBeVisible();

		await userEvent.click(within(screen.getByTestId("VotesFilter")).getByTestId("dropdown__toggle"));

		await waitFor(() =>
			expect(within(screen.getByTestId("VotesFilter")).getByTestId("dropdown__content")).not.toBeDisabled(),
		);

		await userEvent.click(screen.getByTestId("VotesFilter__option--current"));

		await expect(screen.findByTestId("EmptyResults")).resolves.toBeVisible();
	});

	it("should trigger network connection warning", async () => {
		const currentWallet = profile.wallets().findById(walletID);
		const route = `/profiles/${profile.id()}/wallets/${currentWallet.id()}/votes`;

		const walletRestoreMock = vi.spyOn(profile.wallets().first(), "hasSyncedWithNetwork").mockReturnValue(false);

		const history = createHashHistory();
		history.push(route);

		const onProfileSyncError = vi.fn();
		const Component = () => {
			useProfileStatusWatcher({ env, onProfileSyncError, profile });
			return (
				<Route path="/profiles/:profileId/wallets/:walletId/votes">
					<Votes />
				</Route>
			);
		};
		const { asFragment } = render(<Component />, {
			history,
			route: route,
			withProfileSynchronizer: true,
		});

		await expect(screen.findByTestId("DelegateTable")).resolves.toBeVisible();

		await waitFor(() => {
			expect(screen.getByTestId(firstVoteButtonID)).toBeInTheDocument();
		});

		const selectDelegateButton = screen.getByTestId(firstVoteButtonID);

		await userEvent.click(selectDelegateButton);

		expect(screen.getByTestId("DelegateTable__footer")).toBeInTheDocument();
		expect(screen.getByTestId("DelegateTable__footer--total")).toHaveTextContent("1/1");

		await waitFor(() =>
			expect(onProfileSyncError).toHaveBeenCalledWith([expect.any(String)], expect.any(Function)),
		);

		expect(asFragment()).toMatchSnapshot();

		walletRestoreMock.mockRestore();
	});

	it("should emit action on continue button", async () => {
		const route = `/profiles/${profile.id()}/wallets/${wallet.id()}/votes`;
		const { asFragment } = renderPage(route);

		expect(screen.getByTestId("DelegateTable")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByTestId(firstVoteButtonID)).toBeInTheDocument();
		});

		const selectDelegateButton = screen.getByTestId(firstVoteButtonID);

		await userEvent.click(selectDelegateButton);

		expect(screen.getByTestId("DelegateTable__footer")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("DelegateTable__continue-button"));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should emit action on continue button to unvote/vote", async () => {
		const route = `/profiles/${profile.id()}/votes`;
		const { asFragment } = renderPage(route, routePath);

		expect(screen.getByTestId("AddressTable")).toBeInTheDocument();

		await expect(screen.findByTestId("StatusIcon__icon")).resolves.toBeVisible();

		const selectAddressButton = screen.getByTestId("AddressRow__select-1");

		await userEvent.click(selectAddressButton);

		await expect(screen.findByTestId("DelegateTable")).resolves.toBeVisible();

		expect(screen.getByTestId("DelegateTable")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByTestId(firstVoteButtonID)).toBeInTheDocument();
		});

		const selectUnvoteButton = screen.getByTestId(firstVoteButtonID);

		await userEvent.click(selectUnvoteButton);

		expect(screen.getByTestId("DelegateTable__footer")).toBeInTheDocument();

		const selectVoteButton = screen.getByTestId("DelegateRow__toggle-1");

		await userEvent.click(selectVoteButton);

		expect(screen.getByTestId("DelegateTable__footer")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("DelegateTable__continue-button"));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should hide testnet wallet if disabled from profile setting", async () => {
		const resetProfileNetworksMock = mockProfileWithOnlyPublicNetworks(profile);

		const mainnetWallet = await profile.walletFactory().fromAddress({
			address: "AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX",
			coin: "ARK",
			network: "ark.mainnet",
		});

		profile.wallets().push(mainnetWallet);

		const route = `/profiles/${profile.id()}/wallets/${wallet.id()}/votes`;
		const { asFragment, container } = renderPage(route);

		expect(container).toBeInTheDocument();
		expect(screen.getByTestId("DelegateTable")).toBeInTheDocument();

		await expect(screen.findByTestId(firstVoteButtonID)).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		resetProfileNetworksMock();

		// cleanup
		profile.wallets().forget(mainnetWallet.id());
	});

	it("should filter wallets by address", async () => {
		const route = `/profiles/${profile.id()}/votes`;
		renderPage(route, routePath);

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(4));

		await userEvent.click(within(screen.getByTestId("HeaderSearchBar")).getByRole("button"));

		await expect(screen.findByTestId("HeaderSearchBar__input")).resolves.toBeVisible();

		const searchInput = within(screen.getByTestId("HeaderSearchBar__input")).getByTestId("Input");
		await waitFor(() => expect(searchInput).toBeInTheDocument());

		await userEvent.clear(searchInput);
		await userEvent.type(searchInput, "D8rr7B1d6TL6pf1");

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(1));
	});

	it("should filter wallets by alias", async () => {
		const route = `/profiles/${profile.id()}/votes`;
		renderPage(route, routePath);

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(4));

		await userEvent.click(within(screen.getByTestId("HeaderSearchBar")).getByRole("button"));

		await expect(screen.findByTestId("HeaderSearchBar__input")).resolves.toBeVisible();

		const searchInput = within(screen.getByTestId("HeaderSearchBar__input")).getByTestId("Input");
		await waitFor(() => expect(searchInput).toBeInTheDocument());

		await userEvent.clear(searchInput);
		await userEvent.type(searchInput, "ARK Wallet 2");

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(1));
	});

	it("should reset wallet search", async () => {
		const route = `/profiles/${profile.id()}/votes`;
		renderPage(route, routePath);

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(4));

		await userEvent.click(within(screen.getByTestId("HeaderSearchBar")).getByRole("button"));

		await expect(screen.findByTestId("HeaderSearchBar__input")).resolves.toBeVisible();

		const searchInput = within(screen.getByTestId("HeaderSearchBar__input")).getByTestId("Input");
		await waitFor(() => expect(searchInput).toBeInTheDocument());

		// Search by wallet alias
		await userEvent.clear(searchInput);
		await userEvent.type(searchInput, "non existent wallet name");

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(0));

		// Reset search
		await userEvent.click(screen.getByTestId("header-search-bar__reset"));

		await waitFor(() => expect(searchInput).not.toHaveValue());
		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(3));
	});

	it("should show resigned delegate notice", async () => {
		const currentWallet = profile.wallets().first();
		const walletSpy = vi.spyOn(currentWallet.voting(), "current").mockReturnValue([
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					address: "D5L5zXgvqtg7qoGimt5vYhFuf5Ued6iWVr",
					explorerLink: "",
					governanceIdentifier: "address",
					isDelegate: true,
					isResignedDelegate: true,
					publicKey: currentWallet.publicKey(),
					rank: 52,
					username: "arkx",
				}),
			},
		]);
		const route = `/profiles/${profile.id()}/wallets/${currentWallet.id()}/votes`;
		renderPage(route);

		expect(screen.getByTestId("DelegateTable")).toBeInTheDocument();

		await expect(screen.findByTestId("Votes__resigned-vote")).resolves.toBeVisible();

		walletSpy.mockRestore();
	});

	it("should filter delegates by address", async () => {
		const route = `/profiles/${profile.id()}/wallets/${wallet.id()}/votes`;
		renderPage(route);

		await expect(screen.findByTestId("DelegateTable")).resolves.toBeVisible();

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(3));

		await userEvent.click(within(screen.getByTestId("HeaderSearchBar")).getByRole("button"));

		await expect(screen.findByTestId("HeaderSearchBar__input")).resolves.toBeVisible();

		const searchInput = within(screen.getByTestId("HeaderSearchBar__input")).getByTestId("Input");
		await waitFor(() => expect(searchInput).toBeInTheDocument());

		await userEvent.clear(searchInput);
		await userEvent.type(searchInput, "DBk4cPYpqp7EBc");

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(1));
	});

	it("should filter delegates by alias", async () => {
		const route = `/profiles/${profile.id()}/wallets/${wallet.id()}/votes`;
		renderPage(route);

		await expect(screen.findByTestId("DelegateTable")).resolves.toBeVisible();

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(3));

		await userEvent.click(within(screen.getByTestId("HeaderSearchBar")).getByRole("button"));

		await expect(screen.findByTestId("HeaderSearchBar__input")).resolves.toBeVisible();

		const searchInput = within(screen.getByTestId("HeaderSearchBar__input")).getByTestId("Input");
		await waitFor(() => expect(searchInput).toBeInTheDocument());

		await userEvent.clear(searchInput);
		await userEvent.type(searchInput, "itsanametoo");

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(1));
	});
});
