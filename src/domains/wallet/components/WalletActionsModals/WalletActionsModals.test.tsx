import { Contracts } from "@ardenthq/sdk-profiles";
import { screen } from "@testing-library/react";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";
import { WalletActionsModals } from "./WalletActionsModals";
import * as envHooks from "@/app/hooks/env";
import { env, getDefaultProfileId, render, syncDelegates } from "@/utils/testing-library";

const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;
const history = createHashHistory();

describe("WalletActionsModals", () => {
	let profile: Contracts.IProfile;
	let mainnetWallet: Contracts.IReadWriteWallet;
	const setActiveModal = vi.fn();

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		mainnetWallet = await profile.walletFactory().fromAddress({
			address: "AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX",
			coin: "ARK",
			network: "ark.mainnet",
		});

		profile.wallets().push(mainnetWallet);

		await syncDelegates(profile);

		vi.spyOn(envHooks, "useActiveProfile").mockReturnValue(profile);
	});

	beforeEach(() => {
		history.push(dashboardURL);
	});

	it("should render `receive-funds` modal", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletActionsModals
					wallet={mainnetWallet}
					activeModal={"receive-funds"}
					setActiveModal={setActiveModal}
				/>
			</Route>,
			{
				history,
			},
		);

		await expect(screen.findByTestId("ReceiveFunds__toggle")).resolves.toBeInTheDocument();
		await expect(screen.findByTestId("ReceiveFunds__Name_Address")).resolves.toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();
	});

	it("should render `wallet-name` modal", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletActionsModals
					wallet={mainnetWallet}
					activeModal={"wallet-name"}
					setActiveModal={setActiveModal}
				/>
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
				<WalletActionsModals
					wallet={mainnetWallet}
					activeModal={"delete-wallet"}
					setActiveModal={setActiveModal}
				/>
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
				<WalletActionsModals
					wallet={mainnetWallet}
					activeModal={"second-signature"}
					setActiveModal={setActiveModal}
				/>
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
		const walletWithEncryptionMock = vi
			.spyOn(mainnetWallet, "actsWithMnemonicWithEncryption")
			.mockReturnValue(true);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletActionsModals
					wallet={mainnetWallet}
					activeModal={"second-signature"}
					setActiveModal={setActiveModal}
				/>
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
				<WalletActionsModals
					wallet={mainnetWallet}
					activeModal={"unlockable-balances"}
					setActiveModal={setActiveModal}
				/>
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
				<WalletActionsModals
					wallet={mainnetWallet}
					activeModal={"transaction-history"}
					setActiveModal={setActiveModal}
				/>
			</Route>,
			{
				history,
			},
		);

		await expect(screen.findByTestId("TransactionExportForm")).resolves.toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();
	});
});
