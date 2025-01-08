/* eslint-disable testing-library/no-node-access */
/* eslint-disable @typescript-eslint/require-await */
import { Contracts, ReadOnlyWallet } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React, { useEffect } from "react";
import { Route } from "react-router-dom";
import { createHashHistory } from "history";

import { AddressRow, WalletAvatar } from "@/domains/vote/components/AddressTable/AddressRow/AddressRow";
import { data } from "@/tests/fixtures/coins/ark/devnet/delegates.json";
import walletMock from "@/tests/fixtures/coins/ark/devnet/wallets/D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD.json";
import { env, getDefaultProfileId, MNEMONICS, render, screen, syncDelegates } from "@/utils/testing-library";
import { useConfiguration } from "@/app/contexts";
import { server, requestMock } from "@/tests/mocks/server";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let blankWallet: Contracts.IReadWriteWallet;
let unvotedWallet: Contracts.IReadWriteWallet;

let emptyProfile: Contracts.IProfile;
let wallet2: Contracts.IReadWriteWallet;

const blankWalletPassphrase = "power return attend drink piece found tragic fire liar page disease combine";

const AddressWrapper = ({ children }) => {
	const { setConfiguration } = useConfiguration();

	useEffect(() => {
		setConfiguration({ profileHasSyncedOnce: true, profileIsSyncingWallets: false });
	}, []);

	return (
		<Route path="/profiles/:profileId/votes">
			<table>
				<tbody>{children}</tbody>
			</table>
		</Route>
	);
};

const votingMockReturnValue = (delegatesIndex: number[]) =>
	delegatesIndex.map((index) => ({
		amount: 0,
		wallet: new ReadOnlyWallet({
			address: data[index].address,
			explorerLink: `https://test.arkscan.io/wallets/${data[0].address}`,
			governanceIdentifier: "address",
			isDelegate: true,
			isResignedDelegate: false,
			publicKey: data[index].publicKey,
			username: data[index].username,
		}),
	}));

describe("AddressRow", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().findById("ac38fe6d-4b67-4ef1-85be-17c5f6841129");
		wallet.data().set(Contracts.WalletFlag.Starred, true);
		wallet.data().set(Contracts.WalletData.DerivationPath, "0");

		blankWallet = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: blankWalletPassphrase,
			network: "ark.devnet",
		});
		profile.wallets().push(blankWallet);

		unvotedWallet = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: MNEMONICS[0],
			network: "ark.devnet",
		});
		profile.wallets().push(unvotedWallet);

		emptyProfile = env.profiles().findById("cba050f1-880f-45f0-9af9-cfe48f406052");

		wallet2 = await emptyProfile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: MNEMONICS[1],
			network: "ark.devnet",
		});
		profile.wallets().push(wallet2);

		await syncDelegates(profile);
		await wallet.synchroniser().votes();
		await wallet.synchroniser().identity();
		await wallet.synchroniser().coin();
	});

	beforeEach(() => {
		server.use(
			requestMock(`https://ark-test.arkvault.io/api/wallets/${unvotedWallet.address()}`, walletMock),
			requestMock(
				`https://ark-test.arkvault.io/api/wallets/${blankWallet.address()}`,
				{
					error: "Not Found",
					message: "Wallet not found",
					statusCode: 404,
				},
				{ status: 404 },
			),
			requestMock(`https://ark-test.arkvault.io/api/wallets/${wallet2.address()}`, {
				error: "Not Found",
				message: "Wallet not found",
				statusCode: 404,
			}),
		);
	});

	it.each([true, false])("should render when isCompact = %s", async (isCompact: boolean) => {
		const { asFragment, container } = render(
			<AddressWrapper>
				<AddressRow index={0} maxVotes={1} wallet={wallet} isCompact={isCompact} />
			</AddressWrapper>,
			{
				route: `/profiles/${profile.id()}/votes`,
			},
		);

		expect(container).toBeInTheDocument();

		await expect(screen.findByTestId("StatusIcon__icon")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it.each([true, false])(
		"should render with isCompact = %s when the maximum votes is greater than 1",
		(isCompact: boolean) => {
			const votesMock = vi.spyOn(wallet.voting(), "current").mockReturnValue(votingMockReturnValue([0, 1, 2, 3]));

			const { asFragment, container } = render(
				<Route path="/profiles/:profileId/votes">
					<table>
						<tbody>
							<AddressRow index={0} maxVotes={10} wallet={wallet} isCompact={isCompact} />
						</tbody>
					</table>
				</Route>,
				{
					route: `/profiles/${profile.id()}/votes`,
				},
			);

			expect(container).toBeInTheDocument();
			expect(asFragment()).toMatchSnapshot();

			votesMock.mockRestore();
		},
	);

	it.each([true, false])("should render with isCompact = %s when the wallet has many votes", (isCompact: boolean) => {
		const votesMock = vi.spyOn(wallet.voting(), "current").mockReturnValue(votingMockReturnValue([0, 1, 2, 3, 4]));

		const { asFragment, container } = render(
			<AddressWrapper>
				<AddressRow index={0} maxVotes={10} wallet={wallet} isCompact={isCompact} />
			</AddressWrapper>,
			{
				route: `/profiles/${profile.id()}/votes`,
			},
		);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		votesMock.mockRestore();
	});

	it.each([true, false])(
		"should render with isCompact = %s when the wallet has exactly 4 votes",
		(isCompact: boolean) => {
			const votesMock = vi.spyOn(wallet.voting(), "current").mockReturnValue(votingMockReturnValue([0, 1, 2, 3]));

			const { asFragment, container } = render(
				<AddressWrapper>
					<AddressRow index={0} maxVotes={10} wallet={wallet} isCompact={isCompact} />
				</AddressWrapper>,
				{
					route: `/profiles/${profile.id()}/votes`,
				},
			);

			expect(container).toBeInTheDocument();
			expect(asFragment()).toMatchSnapshot();

			votesMock.mockRestore();
		},
	);

	it("should render for a multisignature wallet", async () => {
		const isMultiSignatureSpy = vi.spyOn(wallet, "isMultiSignature").mockImplementation(() => true);
		const { asFragment, container } = render(
			<AddressWrapper>
				<AddressRow index={0} maxVotes={1} wallet={wallet} />
			</AddressWrapper>,
			{
				route: `/profiles/${profile.id()}/votes`,
			},
		);

		expect(container).toBeInTheDocument();

		await expect(screen.findByTestId("StatusIcon__icon")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		isMultiSignatureSpy.mockRestore();
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

		await expect(screen.findByTestId("StatusIcon__icon")).resolves.toBeVisible();
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

		expect(screen.getByTestId("StatusIcon__icon")).toBeVisible();

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
					isDelegate: true,
					isResignedDelegate: false,
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

		expect(screen.getByTestId("StatusIcon__icon")).toBeVisible();

		expect(document.querySelector("svg#circle-check-mark")).toBeInTheDocument();

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
					isDelegate: true,
					isResignedDelegate: false,
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

		expect(screen.getByTestId("StatusIcon__icon")).toBeVisible();

		expect(document.querySelector("svg#clock")).toBeInTheDocument();

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
					isDelegate: true,
					isResignedDelegate: true,
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

		expect(screen.getByTestId("StatusIcon__icon")).toBeVisible();

		expect(document.querySelector("svg#circle-cross")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();

		votesMock.mockRestore();
	});

	it("should emit action on select button", async () => {
		await wallet.synchroniser().identity();
		await wallet.synchroniser().votes();
		await wallet.synchroniser().coin();

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

		await expect(screen.findByTestId("StatusIcon__icon")).resolves.toBeVisible();

		await userEvent.click(selectButton);

		expect(container).toBeInTheDocument();
		expect(onSelect).toHaveBeenCalledWith(wallet.address(), wallet.networkId());
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

		const voteButton = "AddressRow__select-0";
		await expect(screen.findByTestId(voteButton)).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should redirect to wallet details page", async () => {
		const route = `/profiles/${profile.id()}/votes`;
		const history = createHashHistory();

		const historySpy = vi.spyOn(history, "push");
		history.push(route);

		render(
			<AddressWrapper>
				<AddressRow index={0} maxVotes={1} wallet={wallet} />
			</AddressWrapper>,
			{
				history,
				route,
			},
		);

		await expect(screen.findByTestId("AddressRow__wallet")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("AddressRow__wallet"));
		expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);
	});

	it("should render wallet avatar", async () => {
		render(
			<WalletAvatar
				wallet={
					new ReadOnlyWallet({
						address: data[0].address,
						explorerLink: `https://test.arkscan.io/wallets/${data[0].address}`,
						governanceIdentifier: "address",
						isDelegate: true,
						isResignedDelegate: false,
						publicKey: data[0].publicKey,
						username: data[0].username,
					})
				}
			/>,
		);

		expect(screen.getByTestId("Avatar")).toBeInTheDocument();
	});

	it("should render wallet avatar in compact mode", async () => {
		render(
			<WalletAvatar
				useCompact
				wallet={
					new ReadOnlyWallet({
						address: data[0].address,
						explorerLink: `https://test.arkscan.io/wallets/${data[0].address}`,
						governanceIdentifier: "address",
						isDelegate: true,
						isResignedDelegate: false,
						publicKey: data[0].publicKey,
						username: data[0].username,
					})
				}
			/>,
		);

		expect(screen.getByTestId("Avatar")).toBeInTheDocument();
	});

	it("should not render wallet avatar if wallet is not provided", async () => {
		render(<WalletAvatar />);

		expect(screen.queryByTestId("Avatar")).not.toBeInTheDocument();
	});

	it("should render truncated wallet address if username is not available", async () => {
		const votesMock = vi.spyOn(wallet.voting(), "current").mockReturnValue([
			{
				amount: 0,
				wallet: new ReadOnlyWallet({
					address: data[0].address,
					explorerLink: "",
					governanceIdentifier: "address",
					isDelegate: true,
					isResignedDelegate: false,
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
		expect(address).toHaveTextContent("D61mf…3Dyib");

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
