import { Contracts, ReadOnlyWallet } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React, { useEffect } from "react";

import { Votes } from "./Votes";
import { useProfileStatusWatcher } from "@/app/hooks";
import {
	env,
	render,
	screen,
	syncValidators,
	waitFor,
	within,
	mockProfileWithPublicAndTestNetworks,
	getMainsailProfileId,
} from "@/utils/testing-library";
import { useConfiguration } from "@/app/contexts";
import { expect } from "vitest";

let emptyProfile: Contracts.IProfile;
let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let resetProfileNetworksMock: () => void;

const walletID = "ee02b13f-8dbf-4191-a9dc-08d2ab72ec28";

const Wrapper = ({ children }) => {
	const { setConfiguration } = useConfiguration();

	useEffect(() => {
		setConfiguration(profile.id(), { profileHasSyncedOnce: true, profileIsSyncingWallets: false });
	}, []);

	return children;
};

const renderPage = (route: string) =>
	render(
		<Wrapper>
			{" "}
			<Votes />{" "}
		</Wrapper>,
		{ route },
	);

const firstVoteButtonID = "ValidatorRow__toggle-0";

const searchInputID = "SearchableTableWrapper__search-input";

describe("Votes", () => {
	beforeAll(async () => {
		emptyProfile = env.profiles().findById("cba050f1-880f-45f0-9af9-cfe48f406052");
		profile = env.profiles().findById(getMainsailProfileId());
		wallet = profile.wallets().findById(walletID);

		wallet.settings().set(Contracts.WalletSetting.Alias, "Sample Wallet");

		await env.profiles().restore(profile);
		await syncValidators(profile);
		await wallet.synchroniser().votes();
		await profile.sync();
	});

	beforeEach(() => {
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it("should render", async () => {
		const route = `/profiles/${profile.id()}/wallets/${wallet.id()}/votes`;
		const { asFragment } = renderPage(route);

		await waitFor(() => {
			expect(screen.getByTestId("ValidatorsTable")).toBeInTheDocument();
		});

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
		expect(screen.getByTestId("ValidatorsTable")).toBeInTheDocument();

		await expect(screen.findByTestId(firstVoteButtonID)).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		currentMock.mockRestore();
	});

	it("should filter current validators", async () => {
		const currentWallet = profile.wallets().findById(walletID);
		vi.spyOn(currentWallet.voting(), "current").mockReturnValue([
			{
				amount: 0,
				wallet: new ReadOnlyWallet(
					{
						address: "0x1Bf9cf8a006a5279ca81Ea9D3F6aC2D41e1353e2",
						explorerLink: "",
						governanceIdentifier: "address",
						isResignedValidator: false,
						isValidator: true,
						publicKey: currentWallet.publicKey(),
						rank: 52,
						username: "arkx",
					},
					profile,
				),
			},
		]);

		const route = `/profiles/${profile.id()}/wallets/${wallet.id()}/votes`;
		const { asFragment, container } = renderPage(route);

		expect(container).toBeInTheDocument();
		expect(screen.getByTestId("ValidatorsTable")).toBeInTheDocument();

		await expect(screen.findByTestId(firstVoteButtonID)).resolves.toBeVisible();

		const testIdSuffix = "-VotesFilter";

		await userEvent.click(screen.getByTestId("dropdown__toggle" + testIdSuffix));

		await expect(screen.findByTestId("dropdown__content" + testIdSuffix)).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("VotesFilter__option--current"));

		await waitFor(() => expect(screen.getAllByTestId(firstVoteButtonID)).toHaveLength(1));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should open the create wallet side panel", async () => {
		const route = `/profiles/${emptyProfile.id()}/votes`;
		const { asFragment } = renderPage(route);

		expect(screen.getByTestId("EmptyBlock")).toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: /Create/ }));

		expect(screen.getByTestId("CreateAddressSidePanel")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should open the import wallet side panel", async () => {
		const route = `/profiles/${emptyProfile.id()}/votes`;
		const { asFragment } = renderPage(route);

		expect(screen.getByTestId("EmptyBlock")).toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: /Import/ }));

		expect(screen.getByTestId("ImportAddressSidePanel")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should select an address and validator", async () => {
		const currentWallet = profile.wallets().findById(walletID);
		vi.spyOn(currentWallet.voting(), "current").mockReturnValue([
			{
				amount: 0,
				wallet: new ReadOnlyWallet(
					{
						address: "D5L5zXgvqtg7qoGimt5vYhFuf5Ued6iWVr",
						explorerLink: "",
						governanceIdentifier: "address",
						isResignedValidator: false,
						isValidator: true,
						publicKey: currentWallet.publicKey(),
						rank: 52,
						username: "arkx",
					},
					profile,
				),
			},
		]);

		const route = `/profiles/${profile.id()}/votes`;
		const { asFragment } = renderPage(route);

		expect(screen.getByTestId("AddressTable")).toBeInTheDocument();

		await expect(screen.findByTestId("AddressRow__wallet-status")).resolves.toBeVisible();

		const selectAddressButton = screen.getByTestId("AddressRow__select-1");

		await userEvent.click(selectAddressButton);

		expect(screen.getByTestId("ValidatorsTable")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByTestId(firstVoteButtonID)).toBeInTheDocument();
		});

		const selectValidatorButton = screen.getByTestId(firstVoteButtonID);

		await userEvent.click(selectValidatorButton);

		expect(screen.getByTestId("ValidatorTable__footer")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("ValidatorTable__continue-button"));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should select an address without vote", async () => {
		const route = `/profiles/${profile.id()}/votes`;
		renderPage(route);

		expect(screen.getByTestId("AddressTable")).toBeInTheDocument();

		await expect(screen.findByTestId("AddressRow__wallet-status")).resolves.toBeVisible();

		const selectAddressButton = screen.getByTestId("AddressRow__select-1");

		await userEvent.click(selectAddressButton);

		await expect(screen.findByTestId("ValidatorsTable")).resolves.toBeVisible();
	});

	it("should select a validator", async () => {
		const route = `/profiles/${profile.id()}/wallets/${wallet.id()}/votes`;
		const { asFragment } = renderPage(route);

		expect(screen.getByTestId("ValidatorsTable")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByTestId(firstVoteButtonID)).toBeInTheDocument();
		});

		const selectValidatorButton = screen.getByTestId(firstVoteButtonID);

		await userEvent.click(selectValidatorButton);

		expect(screen.getByTestId("ValidatorTable__footer")).toBeInTheDocument();
		expect(screen.getByTestId("ValidatorTable__footer--total")).toHaveTextContent("1/1");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should handle wallet vote error and show empty validators", async () => {
		const route = `/profiles/${profile.id()}/wallets/${wallet.id()}/votes`;

		const walletVoteMock = vi.spyOn(wallet.voting(), "current").mockImplementation(() => {
			throw new Error("validator error");
		});

		renderPage(route);

		expect(screen.getByTestId("ValidatorsTable")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByTestId(firstVoteButtonID)).toBeInTheDocument();
		});

		const selectValidatorButton = screen.getByTestId(firstVoteButtonID);

		await userEvent.click(selectValidatorButton);

		expect(screen.getByTestId("ValidatorTable__footer")).toBeInTheDocument();
		expect(screen.getByTestId("ValidatorTable__footer--total")).toHaveTextContent("1/1");

		walletVoteMock.mockRestore();
	});

	it("should handle resigned validator and show empty results", async () => {
		const currentWallet = profile.wallets().findById(walletID);
		vi.spyOn(currentWallet.voting(), "current").mockReturnValue([
			{
				amount: 0,
				wallet: new ReadOnlyWallet(
					{
						address: "0x1Bf9cf8a006a5279ca81Ea9D3F6aC2D41e1353e2",
						explorerLink: "",
						governanceIdentifier: "address",
						isResignedValidator: true,
						isValidator: true,
						publicKey: currentWallet.publicKey(),
						rank: 52,
						username: "arkx",
					},
					profile,
				),
			},
		]);

		const route = `/profiles/${profile.id()}/wallets/${wallet.id()}/votes`;
		renderPage(route);

		await expect(screen.findByTestId("ValidatorsTable")).resolves.toBeVisible();

		await expect(screen.findByTestId(firstVoteButtonID)).resolves.toBeVisible();

		const testIdSuffix = "-VotesFilter";

		await userEvent.click(screen.getByTestId("dropdown__toggle" + testIdSuffix));

		await expect(screen.findByTestId("dropdown__content" + testIdSuffix)).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("VotesFilter__option--current"));

		await expect(screen.findByTestId("EmptyResults")).resolves.toBeVisible();
	});

	it("should trigger network connection warning", async () => {
		const currentWallet = profile.wallets().findById(walletID);
		const route = `/profiles/${profile.id()}/wallets/${currentWallet.id()}/votes`;

		const walletRestoreMock = vi.spyOn(currentWallet, "hasSyncedWithNetwork").mockReturnValue(false);

		const onProfileSyncError = vi.fn();

		const Component = () => {
			const { setConfiguration } = useConfiguration();

			useEffect(() => {
				setConfiguration(profile.id(), { profileHasSyncedOnce: true, profileIsSyncing: false });
			}, [profile]);

			useProfileStatusWatcher({ onProfileSyncError, profile });
			return <Votes />;
		};

		const { asFragment } = render(<Component />, {
			route,
			withProfileSynchronizer: true,
			withProviders: true,
		});

		await expect(screen.findByTestId("ValidatorsTable")).resolves.toBeVisible();

		await waitFor(() => {
			expect(screen.getByTestId(firstVoteButtonID)).toBeInTheDocument();
		});

		const selectValidatorButton = screen.getByTestId(firstVoteButtonID);

		await userEvent.click(selectValidatorButton);

		expect(screen.getByTestId("ValidatorTable__footer")).toBeInTheDocument();
		expect(screen.getByTestId("ValidatorTable__footer--total")).toHaveTextContent("1/1");

		await waitFor(() =>
			expect(onProfileSyncError).toHaveBeenCalledWith([expect.any(String)], expect.any(Function)),
		);

		expect(asFragment()).toMatchSnapshot();

		walletRestoreMock.mockRestore();
	});

	it("should emit action on continue button", async () => {
		const route = `/profiles/${profile.id()}/wallets/${wallet.id()}/votes`;
		const { asFragment } = renderPage(route);

		expect(screen.getByTestId("ValidatorsTable")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByTestId(firstVoteButtonID)).toBeInTheDocument();
		});

		const selectValidatorButton = screen.getByTestId(firstVoteButtonID);

		await userEvent.click(selectValidatorButton);

		expect(screen.getByTestId("ValidatorTable__footer")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("ValidatorTable__continue-button"));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should emit action on continue button to unvote/vote", async () => {
		const route = `/profiles/${profile.id()}/votes`;
		const { asFragment } = renderPage(route);

		expect(screen.getByTestId("AddressTable")).toBeInTheDocument();

		await expect(screen.findByTestId("AddressRow__wallet-status")).resolves.toBeVisible();

		const selectAddressButton = screen.getByTestId("AddressRow__select-1");

		await userEvent.click(selectAddressButton);

		await expect(screen.findByTestId("ValidatorsTable")).resolves.toBeVisible();

		expect(screen.getByTestId("ValidatorsTable")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByTestId(firstVoteButtonID)).toBeInTheDocument();
		});

		const selectUnvoteButton = screen.getByTestId(firstVoteButtonID);

		await userEvent.click(selectUnvoteButton);

		expect(screen.getByTestId("ValidatorTable__footer")).toBeInTheDocument();

		const selectVoteButton = screen.getByTestId("ValidatorRow__toggle-1");

		await userEvent.click(selectVoteButton);

		expect(screen.getByTestId("ValidatorTable__footer")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("ValidatorTable__continue-button"));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should filter wallets by address", async () => {
		const route = `/profiles/${profile.id()}/votes`;
		renderPage(route);

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(2));

		await expect(screen.findByTestId(searchInputID)).resolves.toBeVisible();

		const searchInput = within(screen.getByTestId(searchInputID)).getByTestId("Input");
		await waitFor(() => expect(searchInput).toBeInTheDocument());

		await userEvent.clear(searchInput);
		await userEvent.type(searchInput, "0xcd15953");

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(1));
	});

	it("should filter wallets by alias", async () => {
		const route = `/profiles/${profile.id()}/votes`;
		renderPage(route);

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(2));

		await expect(screen.findByTestId(searchInputID)).resolves.toBeVisible();

		const searchInput = within(screen.getByTestId(searchInputID)).getByTestId("Input");
		await waitFor(() => expect(searchInput).toBeInTheDocument());

		await userEvent.clear(searchInput);
		await userEvent.type(searchInput, "Mainsail Wallet 1");

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(1));
	});

	it("should show resigned validator notice", async () => {
		const currentWallet = profile.wallets().first();
		const walletSpy = vi.spyOn(currentWallet.voting(), "current").mockReturnValue([
			{
				amount: 0,
				wallet: new ReadOnlyWallet(
					{
						address: "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
						explorerLink: "",
						governanceIdentifier: "address",
						isResignedValidator: true,
						isValidator: true,
						publicKey: currentWallet.publicKey(),
						rank: 52,
						username: "arkx",
					},
					profile,
				),
			},
		]);
		const route = `/profiles/${profile.id()}/wallets/${currentWallet.id()}/votes`;
		renderPage(route);

		expect(screen.getByTestId("ValidatorsTable")).toBeInTheDocument();

		await expect(screen.findByTestId("Votes__resigned-vote")).resolves.toBeVisible();

		walletSpy.mockRestore();
	});

	it("should filter validators by address", async () => {
		const route = `/profiles/${profile.id()}/wallets/${wallet.id()}/votes`;
		renderPage(route);

		await expect(screen.findByTestId("ValidatorsTable")).resolves.toBeVisible();

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(53));

		await expect(screen.findByTestId(searchInputID)).resolves.toBeVisible();

		const searchInput = within(screen.getByTestId(searchInputID)).getByTestId("Input");
		await waitFor(() => expect(searchInput).toBeInTheDocument());

		await userEvent.clear(searchInput);
		await userEvent.type(searchInput, "0x1Bf9cf8a006");

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(1));
	});

	it("should filter validators by alias", async () => {
		const route = `/profiles/${profile.id()}/wallets/${wallet.id()}/votes`;
		renderPage(route);

		await expect(screen.findByTestId("ValidatorsTable")).resolves.toBeVisible();

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(53));

		await expect(screen.findByTestId(searchInputID)).resolves.toBeVisible();

		const searchInput = within(screen.getByTestId(searchInputID)).getByTestId("Input");
		await waitFor(() => expect(searchInput).toBeInTheDocument());

		await userEvent.clear(searchInput);
		await userEvent.type(searchInput, "vault_test_address");

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(1));
	});
});
