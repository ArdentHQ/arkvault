import { Contracts, ReadOnlyWallet } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React, { useEffect } from "react";

import { AddressRow } from "@/domains/vote/components/AddressTable/AddressRow/AddressRow";
import { data } from "@/tests/fixtures/coins/mainsail/devnet/validators.json";
import { env, getMainsailProfileId, MAINSAIL_MNEMONICS, render, screen, syncValidators } from "@/utils/testing-library";
import { useConfiguration } from "@/app/contexts";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let blankWallet: Contracts.IReadWriteWallet;
let unvotedWallet: Contracts.IReadWriteWallet;

let emptyProfile: Contracts.IProfile;
let wallet2: Contracts.IReadWriteWallet;

const blankWalletPassphrase = "power return attend drink piece found tragic fire liar page disease combine";

const ADDRESS_ROW_STATUS_TEST_ID = "AddressRow__wallet-status";
const FIRST_ADDRESS_VOTE_BUTTON = "AddressRow__select-0";

const AddressWrapper = ({ children }) => {
	const { setConfiguration } = useConfiguration();

	useEffect(() => {
		setConfiguration(profile.id(), { profileHasSyncedOnce: true, profileIsSyncingWallets: false });
	}, []);

	return (
		<table>
			<tbody>{children}</tbody>
		</table>
	);
};

const votingMockReturnValue = (validatorsIndex: number[]) =>
	validatorsIndex.map((index) => ({
		amount: 0,
		wallet: new ReadOnlyWallet({
			address: data[index].address,
			explorerLink: `https://test.arkscan.io/wallets/${data[0].address}`,
			governanceIdentifier: "address",
			isResignedValidator: false,
			isValidator: true,
			publicKey: data[index].publicKey,
			username: data[index].attributes.username,
		}),
	}));

describe("AddressRow", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		wallet = profile.wallets().findById("ee02b13f-8dbf-4191-a9dc-08d2ab72ec28");
		wallet.data().set(Contracts.WalletFlag.Starred, true);
		wallet.data().set(Contracts.WalletData.DerivationPath, "0");

		blankWallet = await profile.walletFactory().fromMnemonicWithBIP39({
			mnemonic: blankWalletPassphrase,
		});
		profile.wallets().push(blankWallet);

		unvotedWallet = await profile.walletFactory().fromMnemonicWithBIP39({
			mnemonic: MAINSAIL_MNEMONICS[0],
		});

		profile.wallets().push(unvotedWallet);

		emptyProfile = env.profiles().findById("cba050f1-880f-45f0-9af9-cfe48f406052");

		wallet2 = await emptyProfile.walletFactory().fromMnemonicWithBIP39({
			mnemonic: MAINSAIL_MNEMONICS[1],
		});
		profile.wallets().push(wallet2);

		await profile.sync();
		await syncValidators(profile);

		await wallet.synchroniser().votes();
		await wallet.synchroniser().identity();
	});

	it("should render", async () => {
		const { asFragment, container } = render(
			<AddressWrapper>
				<AddressRow index={0} maxVotes={1} wallet={wallet} />
			</AddressWrapper>,
			{
				route: `/profiles/${profile.id()}/votes`,
			},
		);

		expect(container).toBeInTheDocument();

		await expect(screen.findByTestId(ADDRESS_ROW_STATUS_TEST_ID)).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render when the maximum votes is greater than 1", () => {
		const votesMock = vi.spyOn(wallet.voting(), "current").mockReturnValue(votingMockReturnValue([0, 1, 2, 3]));

		const { asFragment, container } = render(
			<table>
				<tbody>
					<AddressRow index={0} maxVotes={10} wallet={wallet} />
				</tbody>
			</table>,
			{
				route: `/profiles/${profile.id()}/votes`,
			},
		);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		votesMock.mockRestore();
	});

	it("should render when the wallet has many votes", () => {
		const votesMock = vi.spyOn(wallet.voting(), "current").mockReturnValue(votingMockReturnValue([0, 1, 2, 3, 4]));

		const { asFragment, container } = render(
			<AddressWrapper>
				<AddressRow index={0} maxVotes={10} wallet={wallet} />
			</AddressWrapper>,
			{
				route: `/profiles/${profile.id()}/votes`,
			},
		);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		votesMock.mockRestore();
	});

	it("should render when the wallet has exactly 4 votes", () => {
		const votesMock = vi.spyOn(wallet.voting(), "current").mockReturnValue(votingMockReturnValue([0, 1, 2, 3]));

		const { asFragment, container } = render(
			<AddressWrapper>
				<AddressRow index={0} maxVotes={10} wallet={wallet} />
			</AddressWrapper>,
			{
				route: `/profiles/${profile.id()}/votes`,
			},
		);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		votesMock.mockRestore();
	});

	it("should render when wallet not found for votes", async () => {
		const { asFragment } = render(
			<AddressWrapper>
				<AddressRow index={0} maxVotes={1} wallet={wallet} />
				<AddressRow index={1} maxVotes={1} wallet={blankWallet} />
			</AddressWrapper>,
			{
				route: `/profiles/${profile.id()}/votes`,
			},
		);

		await expect(screen.findByTestId(ADDRESS_ROW_STATUS_TEST_ID)).resolves.toBeVisible();
		await expect(screen.findByTestId("AddressRow__select-0")).resolves.toBeVisible();
		await expect(screen.findByTestId("AddressRow__select-1")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render when wallet hasn't voted", async () => {
		const { asFragment } = render(
			<AddressWrapper>
				<AddressRow index={0} maxVotes={1} wallet={wallet} />
				<AddressRow index={1} maxVotes={1} wallet={unvotedWallet} />
			</AddressWrapper>,
			{
				route: `/profiles/${profile.id()}/votes`,
			},
		);

		await expect(screen.findByTestId(ADDRESS_ROW_STATUS_TEST_ID)).resolves.toBeVisible();

		await expect(screen.findByTestId("AddressRow__select-0")).resolves.toBeVisible();
		await expect(screen.findByTestId("AddressRow__select-1")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with active validator", async () => {
		const votesMock = vi.spyOn(wallet.voting(), "current").mockReturnValue([
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					address: data[0].address,
					explorerLink: "",
					governanceIdentifier: "address",
					isResignedValidator: false,
					isValidator: true,
					publicKey: data[0].publicKey,
					rank: 1,
					username: data[0].username,
				}),
			},
		]);

		const { asFragment } = render(
			<AddressWrapper>
				<AddressRow index={0} maxVotes={1} wallet={wallet} />
			</AddressWrapper>,
			{
				route: `/profiles/${profile.id()}/votes`,
			},
		);

		await expect(screen.findByTestId(ADDRESS_ROW_STATUS_TEST_ID)).resolves.toBeVisible();

		expect(screen.getByTestId(ADDRESS_ROW_STATUS_TEST_ID).textContent).toBe("Active");

		expect(asFragment()).toMatchSnapshot();

		votesMock.mockRestore();
	});

	it("should render with standby validator", async () => {
		const votesMock = vi.spyOn(wallet.voting(), "current").mockReturnValue([
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					address: data[0].address,
					explorerLink: "",
					governanceIdentifier: "address",
					isResignedValidator: false,
					isValidator: true,
					publicKey: data[0].publicKey,
					rank: 100,
					username: data[0].username,
				}),
			},
		]);

		const { asFragment } = render(
			<AddressWrapper>
				<AddressRow index={0} maxVotes={1} wallet={wallet} />
			</AddressWrapper>,
			{
				route: `/profiles/${profile.id()}/votes`,
			},
		);

		await expect(screen.findByTestId(ADDRESS_ROW_STATUS_TEST_ID)).resolves.toBeVisible();

		expect(screen.getByTestId(ADDRESS_ROW_STATUS_TEST_ID).textContent).toBe("Standby");

		expect(asFragment()).toMatchSnapshot();

		votesMock.mockRestore();
	});

	it("should render with resigned validator", async () => {
		const votesMock = vi.spyOn(wallet.voting(), "current").mockReturnValue([
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					address: data[0].address,
					explorerLink: "",
					governanceIdentifier: "address",
					isResignedValidator: true,
					isValidator: true,
					publicKey: data[0].publicKey,
					rank: undefined,
					username: data[0].username,
				}),
			},
		]);

		const { asFragment } = render(
			<AddressWrapper>
				<AddressRow index={0} maxVotes={1} wallet={wallet} />
			</AddressWrapper>,
			{
				route: `/profiles/${profile.id()}/votes`,
			},
		);

		await expect(screen.findByTestId(ADDRESS_ROW_STATUS_TEST_ID)).resolves.toBeVisible();

		expect(screen.getByTestId(ADDRESS_ROW_STATUS_TEST_ID).textContent).toBe("Resigned");

		expect(asFragment()).toMatchSnapshot();

		votesMock.mockRestore();
	});

	it("should emit action on select button", async () => {
		await wallet.synchroniser().identity();
		await wallet.synchroniser().votes();

		const onSelect = vi.fn();
		const { asFragment, container } = render(
			<AddressWrapper>
				<AddressRow index={0} maxVotes={1} wallet={wallet} onSelect={onSelect} />
			</AddressWrapper>,
			{
				route: `/profiles/${profile.id()}/votes`,
			},
		);
		const selectButton = screen.getByTestId("AddressRow__select-0");

		await expect(screen.findByTestId(ADDRESS_ROW_STATUS_TEST_ID)).resolves.toBeVisible();

		await userEvent.click(selectButton);

		expect(container).toBeInTheDocument();
		expect(onSelect).toHaveBeenCalledWith(wallet.address());
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render tooltip wallet when ledger and incompatible", async () => {
		process.env.REACT_APP_IS_UNIT = undefined;
		vi.spyOn(wallet, "isLedger").mockReturnValue(true);

		const { asFragment, container } = render(
			<AddressWrapper>
				<AddressRow index={0} maxVotes={1} wallet={wallet} />
			</AddressWrapper>,
			{
				route: `/profiles/${profile.id()}/votes`,
			},
		);

		expect(container).toBeInTheDocument();

		await expect(screen.findByTestId(FIRST_ADDRESS_VOTE_BUTTON)).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render tooltip wallet when balance is zero", async () => {
		vi.spyOn(wallet, "balance").mockReturnValue(0);

		render(
			<AddressWrapper>
				<AddressRow index={0} maxVotes={1} wallet={wallet} />
			</AddressWrapper>,
			{
				route: `/profiles/${profile.id()}/votes`,
			},
		);

		await expect(screen.findByTestId(FIRST_ADDRESS_VOTE_BUTTON)).resolves.toBeVisible();

		await userEvent.hover(screen.getByTestId(FIRST_ADDRESS_VOTE_BUTTON));

		expect(screen.getByText(/Disabled due to insufficient balance./)).toBeInTheDocument();
	});

	// @TODO fix test when we are clear
	it.skip("should redirect to wallet details page", async () => {
		const route = `/profiles/${profile.id()}/votes`;

		const { router } = render(
			<AddressWrapper>
				<AddressRow index={0} maxVotes={1} wallet={wallet} />
			</AddressWrapper>,
			{
				route,
			},
		);

		await expect(screen.findByTestId("AddressRow__wallet")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("AddressRow__wallet"));
		expect(router.state.location.pathname).toBe(`/profiles/${profile.id()}/wallets/${wallet.id()}`);
	});

	it("should render truncated wallet address if username is not available", async () => {
		const votesMock = vi.spyOn(wallet.voting(), "current").mockReturnValue([
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					address: data[0].address,
					explorerLink: "",
					governanceIdentifier: "address",
					isResignedValidator: false,
					isValidator: true,
					publicKey: data[0].publicKey,
					rank: 1,
					username: undefined,
				}),
			},
		]);

		const { container } = render(
			<AddressWrapper>
				<AddressRow index={0} maxVotes={1} wallet={wallet} />
			</AddressWrapper>,
			{
				route: `/profiles/${profile.id()}/votes`,
			},
		);

		expect(container).toBeInTheDocument();

		const address = screen.getByTestId("AddressRow__wallet-vote");
		expect(address).toHaveTextContent("0xB8B…94362");

		votesMock.mockRestore();
	});

	it("should not render neither username nor truncated address if both are not available", async () => {
		const votesMock = vi.spyOn(wallet.voting(), "current").mockReturnValue([
			{
				amount: 0,
				wallet: undefined,
			},
		]);

		const { container } = render(
			<AddressWrapper>
				<AddressRow index={0} maxVotes={1} wallet={wallet} />
			</AddressWrapper>,
			{
				route: `/profiles/${profile.id()}/votes`,
			},
		);

		expect(container).toBeInTheDocument();
		expect(screen.queryByText("D61mf…3Dyib")).not.toBeInTheDocument();

		votesMock.mockRestore();
	});
});
