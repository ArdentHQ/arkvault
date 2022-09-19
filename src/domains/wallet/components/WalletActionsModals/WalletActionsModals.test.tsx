import { Contracts } from "@ardenthq/sdk-profiles";
import { screen } from "@testing-library/react";
import { createHashHistory } from "history";
import nock from "nock";
import React from "react";
import { Route } from "react-router-dom";
import { WalletActionsModals } from "./WalletActionsModals";
import * as envHooks from "@/app/hooks/env";
import { LedgerProvider } from "@/app/contexts";
import { env, getDefaultProfileId, render, syncDelegates } from "@/utils/testing-library";

const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;
const history = createHashHistory();

describe("WalletActionsModals", () => {
	let profile: Contracts.IProfile;
	let mainnetWallet: Contracts.IReadWriteWallet;
	const setActiveModal = jest.fn();

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		mainnetWallet = await profile.walletFactory().fromAddress({
			address: "AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX",
			coin: "ARK",
			network: "ark.mainnet",
		});

		profile.wallets().push(mainnetWallet);

		nock("https://ark-live.arkvault.io")
			.get("/api/transactions")
			.query({ orderBy: "timestamp:asc", address: mainnetWallet.address() })
			.reply(200, require("tests/fixtures/coins/ark/devnet/transactions.json"))
			.persist();

		await syncDelegates(profile);

		jest.spyOn(envHooks, "useActiveProfile").mockReturnValue(profile);
	});

	beforeEach(() => {
		history.push(dashboardURL);
	});

	it("should render `receive-funds` modal", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<LedgerProvider>
					<WalletActionsModals
						wallet={mainnetWallet}
						activeModal={"receive-funds"}
						setActiveModal={setActiveModal}
					/>
				</LedgerProvider>
			</Route>,
			{
				history,
			},
		);

		expect(screen.getByTestId("ReceiveFunds__address")).toBeInTheDocument();
		await expect(screen.findByTestId("ReceiveFunds__toggle")).resolves.toBeInTheDocument();
		await expect(screen.findByTestId("ReceiveFunds__name")).resolves.toBeInTheDocument();
		await expect(screen.findByTestId("ReceiveFunds__address")).resolves.toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();
	});

	it("should render `wallet-name` modal", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<LedgerProvider>
					<WalletActionsModals
						wallet={mainnetWallet}
						activeModal={"wallet-name"}
						setActiveModal={setActiveModal}
					/>
				</LedgerProvider>
			</Route>,
			{
				history,
			},
		);

		expect(screen.getByTestId("UpdateWalletName__input")).toBeInTheDocument();
		await expect(screen.findByTestId("UpdateWalletName__input")).resolves.toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();
	});

	it("should render `delete-wallet` modal", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<LedgerProvider>
					<WalletActionsModals
						wallet={mainnetWallet}
						activeModal={"delete-wallet"}
						setActiveModal={setActiveModal}
					/>
				</LedgerProvider>
			</Route>,
			{
				history,
			},
		);

		expect(screen.getByTestId("DeleteResource__submit-button")).toBeInTheDocument();
		await expect(screen.findByTestId("SelectAddress__wrapper")).resolves.toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();
	});

	it("should render `second-signature` modal", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<LedgerProvider>
					<WalletActionsModals
						wallet={mainnetWallet}
						activeModal={"second-signature"}
						setActiveModal={setActiveModal}
					/>
				</LedgerProvider>
			</Route>,
			{
				history,
			},
		);

		expect(screen.getByTestId("WalletEncryptionWarning__submit-button")).toBeInTheDocument();
		await expect(screen.findByTestId("WalletEncryptionWarning__submit-button")).resolves.toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();
	});

	it("should render `second-signature` modal with mnemonic encryption wallet", async () => {
		const walletWithEncryptionMock = jest
			.spyOn(mainnetWallet, "actsWithMnemonicWithEncryption")
			.mockReturnValue(true);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<LedgerProvider>
					<WalletActionsModals
						wallet={mainnetWallet}
						activeModal={"second-signature"}
						setActiveModal={setActiveModal}
					/>
				</LedgerProvider>
			</Route>,
			{
				history,
			},
		);

		expect(screen.getByTestId("WalletEncryptionWarning__submit-button")).toBeInTheDocument();
		await expect(screen.findByTestId("WalletEncryptionWarning__submit-button")).resolves.toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();

		walletWithEncryptionMock.mockRestore();
	});

	it("should render `unlockable-balances` modal", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<LedgerProvider>
					<WalletActionsModals
						wallet={mainnetWallet}
						activeModal={"unlockable-balances"}
						setActiveModal={setActiveModal}
					/>
				</LedgerProvider>
			</Route>,
			{
				history,
			},
		);

		await expect(screen.findByTestId("UnlockTokensModal")).resolves.toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();
	});

	it("should render `transaction-history` modal", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<LedgerProvider>
					<WalletActionsModals
						wallet={mainnetWallet}
						activeModal={"transaction-history"}
						setActiveModal={setActiveModal}
					/>
				</LedgerProvider>
			</Route>,
			{
				history,
			},
		);

		await expect(screen.findByTestId("TransactionExportForm")).resolves.toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();
	});
});
