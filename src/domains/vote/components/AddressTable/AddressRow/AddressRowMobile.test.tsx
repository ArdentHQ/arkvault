/* eslint-disable testing-library/no-node-access */
/* eslint-disable @typescript-eslint/require-await */
import { Contracts, ReadOnlyWallet } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React, { useEffect } from "react";
import { Route } from "react-router-dom";

import { Context as ResponsiveContext } from "react-responsive";
import {
	AddressRowMobile,
	AddressRowMobileDelegateName,
} from "@/domains/vote/components/AddressTable/AddressRow/AddressRowMobile";
import { data } from "@/tests/fixtures/coins/ark/devnet/delegates.json";
import walletMock from "@/tests/fixtures/coins/ark/devnet/wallets/D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD.json";
import { env, getDefaultProfileId, MNEMONICS, render, screen, syncDelegates } from "@/utils/testing-library";
import { useConfiguration } from "@/app/contexts";
import { server, requestMock } from "@/tests/mocks/server";
import {createHashHistory} from "history";

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
			explorerLink: "",
			governanceIdentifier: "address",
			isDelegate: true,
			isResignedDelegate: false,
			publicKey: data[index].publicKey,
			username: data[index].username,
		}),
	}));

describe("AddressRowMobile", () => {
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

	it("should render for a multisignature wallet", async () => {
		const isMultiSignatureSpy = vi.spyOn(wallet, "isMultiSignature").mockImplementation(() => true);
		const { asFragment, container } = render(
			<AddressWrapper>
				<AddressRowMobile index={0} maxVotes={1} wallet={wallet} />
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

	it.each([375, 420])("should render in %s screen width", (width: number) => {
		const votesMock = vi.spyOn(wallet.voting(), "current").mockReturnValue(votingMockReturnValue([0, 1, 2, 3, 4]));

		const { asFragment, container } = render(
			<ResponsiveContext.Provider value={{ width }}>
				<AddressWrapper>
					<AddressRowMobile index={0} maxVotes={1} wallet={wallet} />
				</AddressWrapper>
				,
			</ResponsiveContext.Provider>,
			{
				route: `/profiles/${profile.id()}/votes`,
			},
		);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		votesMock.mockRestore();
	});

	it("should not render delegate name if name is not provided", async () => {
		const { asFragment } = render(<AddressRowMobileDelegateName />, {
			route: `/profiles/${profile.id()}/votes`,
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render when wallet not found for votes", async () => {
		const { asFragment } = render(
			<AddressWrapper>
				<AddressRowMobile index={0} maxVotes={1} wallet={wallet} />
				<AddressRowMobile index={1} maxVotes={1} wallet={blankWallet} />
			</AddressWrapper>,
			{
				route: `/profiles/${profile.id()}/votes`,
			},
		);

		await expect(screen.findByTestId("StatusIcon__icon")).resolves.toBeVisible();
		await expect(screen.findByTestId("AddressRowMobile__select-0")).resolves.toBeVisible();
		await expect(screen.findByTestId("AddressRowMobile__select-1")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render when wallet not loaded", () => {
		const votesMock = vi.spyOn(wallet.voting(), "current").mockReturnValue([
			{
				amount: 0,
			},
		]);

		const { asFragment } = render(
			<AddressWrapper>
				<AddressRowMobile index={0} maxVotes={1} wallet={wallet} />
			</AddressWrapper>,
			{
				route: `/profiles/${profile.id()}/votes`,
			},
		);

		expect(screen.getByTestId("AddressRowMobile--nowallet")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();

		votesMock.mockRestore();
	});

	it("should render when wallet hasn't voted", async () => {
		const { asFragment } = render(
			<AddressWrapper>
				<AddressRowMobile index={0} maxVotes={1} wallet={wallet} />
				<AddressRowMobile index={1} maxVotes={1} wallet={unvotedWallet} />
			</AddressWrapper>,
			{
				route: `/profiles/${profile.id()}/votes`,
			},
		);

		expect(screen.getByTestId("StatusIcon__icon")).toBeVisible();

		await expect(screen.findByTestId("AddressRowMobile__select-0")).resolves.toBeVisible();
		await expect(screen.findByTestId("AddressRowMobile__select-1")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with active delegate", async () => {
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
				<AddressRowMobile index={0} maxVotes={1} wallet={wallet} />
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

	it("should render with standby delegate", async () => {
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
				<AddressRowMobile index={0} maxVotes={1} wallet={wallet} />
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

	it("should render with resigned delegate", async () => {
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
				<AddressRowMobile index={0} maxVotes={1} wallet={wallet} />
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
				<AddressRowMobile index={0} maxVotes={1} wallet={wallet} onSelect={onSelect} />
			</AddressWrapper>,
			{
				route: `/profiles/${profile.id()}/votes`,
			},
		);
		const selectButton = screen.getByTestId("AddressRowMobile__select-0");

		await expect(screen.findByTestId("StatusIcon__icon")).resolves.toBeVisible();

		await userEvent.click(selectButton);

		expect(container).toBeInTheDocument();
		expect(onSelect).toHaveBeenCalledWith(wallet.address(), wallet.networkId());
		expect(asFragment()).toMatchSnapshot();
	});

	it("should redirect to wallet details page", async () => {
		const history = createHashHistory();

		const  { container } = render(
			<AddressWrapper>
				<AddressRowMobile index={0} maxVotes={1} wallet={wallet} onSelect={vi.fn()} />
			</AddressWrapper>,
			{
				history,
				route: `/profiles/${profile.id()}/votes`,
			},
		);

		const historySpy = vi.spyOn(history, "push");

		// eslint-disable-next-line testing-library/no-container
		const containerDiv = container.querySelector("tr td > div") as HTMLDivElement;

		await userEvent.click(containerDiv);
		expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

	});

	it("should render when the maximum votes is greater than 1", () => {
		const votesMock = vi.spyOn(wallet.voting(), "current").mockReturnValue(votingMockReturnValue([0, 1, 2, 3]));

		const { asFragment, container } = render(
			<AddressWrapper>
				<AddressRowMobile index={0} maxVotes={10} wallet={wallet} />
			</AddressWrapper>,
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
				<AddressRowMobile index={0} maxVotes={10} wallet={wallet} />
			</AddressWrapper>,
			{
				route: `/profiles/${profile.id()}/votes`,
			},
		);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		votesMock.mockRestore();
	});
});
