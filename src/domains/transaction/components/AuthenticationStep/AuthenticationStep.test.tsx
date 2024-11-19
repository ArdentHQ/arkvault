import { PBKDF2 } from "@ardenthq/sdk-cryptography";
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";
import * as reactRouterDomMock from "react-router-dom";
import { AuthenticationStep } from "./AuthenticationStep";
import {
	env,
	getDefaultProfileId,
	getDefaultWalletMnemonic,
	MNEMONICS,
	renderWithForm,
	screen,
	waitFor,
	mockNanoXTransport,
	mockNanoSTransport,
	mockLedgerTransportError,
} from "@/utils/testing-library";
const secondMnemonicID = "AuthenticationStep__second-mnemonic";
const ARKDevnet = "ark.devnet";

vi.mock("react-router-dom", async () => ({
	...(await vi.importActual("react-router-dom")),
}));

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

describe.each(["transaction", "message"])("AuthenticationStep (%s)", (subject) => {
	let wallet: Contracts.IReadWriteWallet;
	let profile: Contracts.IProfile;
	let goMock: any;
	const mnemonicMismatchError = "This mnemonic does not correspond to your wallet";

	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();
		goMock = vi.fn();

		vi.spyOn(reactRouterDomMock, "useHistory").mockReturnValue({ go: goMock });
	});

	it("should validate if mnemonic match the wallet address", async () => {
		wallet = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: MNEMONICS[0],
			network: ARKDevnet,
		});

		const walletExists = profile.wallets().findByAddressWithNetwork(wallet.address(), wallet.networkId());

		if (!walletExists) {
			profile.wallets().push(wallet);
		}

		vi.spyOn(wallet, "isSecondSignature").mockReturnValue(false);

		const { form } = renderWithForm(<AuthenticationStep subject={subject} wallet={wallet} />, {
			withProviders: true,
		});

		await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), "wrong passphrase");

		await waitFor(() => expect(form()?.formState.errors.mnemonic.message).toBe(mnemonicMismatchError));

		await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), MNEMONICS[0]);

		await waitFor(() => expect(form()?.formState.isValid).toBeTruthy());

		profile.wallets().forget(wallet.id());
		vi.clearAllMocks();
	});

	it("should request mnemonic if wallet was imported using mnemonic", async () => {
		wallet = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: MNEMONICS[2],
			network: ARKDevnet,
		});

		const isSecondSignatureMock = vi.spyOn(wallet, "isSecondSignature").mockReturnValue(false);

		const { form, asFragment } = renderWithForm(<AuthenticationStep subject={subject} wallet={wallet} />, {
			withProviders: true,
		});

		await waitFor(() => expect(screen.queryByTestId(secondMnemonicID)).toBeNull());

		expect(screen.getByTestId("AuthenticationStep__mnemonic")).toBeInTheDocument();

		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), MNEMONICS[0]);

		await waitFor(() => expect(form()?.getValues()).toStrictEqual({ mnemonic: MNEMONICS[0] }));

		expect(asFragment()).toMatchSnapshot();

		isSecondSignatureMock.mockRestore();
	});

	it("should request secret if wallet was imported using secret", async () => {
		wallet = await profile.walletFactory().fromSecret({
			coin: "ARK",
			network: ARKDevnet,
			secret: "secret",
		});

		const isSecondSignatureMock = vi.spyOn(wallet, "isSecondSignature").mockReturnValue(false);

		const { form, asFragment } = renderWithForm(<AuthenticationStep subject={subject} wallet={wallet} />, {
			withProviders: true,
		});

		await waitFor(() => expect(screen.queryByTestId(secondMnemonicID)).toBeNull());

		expect(screen.getByTestId("AuthenticationStep__secret")).toBeInTheDocument();

		await userEvent.type(screen.getByTestId("AuthenticationStep__secret"), "secret");

		await waitFor(() => expect(form()?.getValues()).toStrictEqual({ secret: "secret" }));

		expect(asFragment()).toMatchSnapshot();

		isSecondSignatureMock.mockRestore();
	});

	it("should request mnemonic if wallet was imported using address", async () => {
		wallet = await profile.walletFactory().fromAddress({
			address: "DJpFwW39QnQvQRQJF2MCfAoKvsX4DJ28jq",
			coin: "ARK",
			network: ARKDevnet,
		});

		const isSecondSignatureMock = vi.spyOn(wallet, "isSecondSignature").mockReturnValue(false);

		const { form, asFragment } = renderWithForm(<AuthenticationStep subject={subject} wallet={wallet} />, {
			withProviders: true,
		});

		await waitFor(() => expect(screen.queryByTestId(secondMnemonicID)).toBeNull());

		expect(screen.getByTestId("AuthenticationStep__mnemonic")).toBeInTheDocument();

		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), MNEMONICS[0]);

		await waitFor(() => expect(form()?.getValues()).toStrictEqual({ mnemonic: MNEMONICS[0] }));

		expect(asFragment()).toMatchSnapshot();

		isSecondSignatureMock.mockRestore();
	});

	it("should request private key if wallet was imported using private key", async () => {
		wallet = await profile.walletFactory().fromPrivateKey({
			coin: "ARK",
			network: ARKDevnet,
			privateKey: "d8839c2432bfd0a67ef10a804ba991eabba19f154a3d707917681d45822a5712",
		});

		vi.spyOn(wallet, "isSecondSignature").mockReturnValueOnce(false);

		const { asFragment } = renderWithForm(<AuthenticationStep subject={subject} wallet={wallet} />, {
			withProviders: true,
		});

		await waitFor(() => expect(screen.queryByTestId(secondMnemonicID)).toBeNull());

		expect(screen.getByTestId("AuthenticationStep__private-key")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should request WIF if wallet was imported using WIF", async () => {
		wallet = await profile.walletFactory().fromWIF({
			coin: "ARK",
			network: ARKDevnet,
			wif: "SGq4xLgZKCGxs7bjmwnBrWcT4C1ADFEermj846KC97FSv1WFD1dA",
		});

		vi.spyOn(wallet, "isSecondSignature").mockReturnValueOnce(false);

		const { asFragment } = renderWithForm(<AuthenticationStep subject={subject} wallet={wallet} />, {
			withProviders: true,
		});

		await waitFor(() => expect(screen.queryByTestId(secondMnemonicID)).toBeNull());

		expect(screen.getByTestId("AuthenticationStep__wif")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should show only ledger confirmation", async () => {
		mockNanoXTransport();
		vi.spyOn(wallet, "isLedger").mockReturnValueOnce(true);

		const { asFragment } = renderWithForm(<AuthenticationStep subject={subject} wallet={wallet} />, {
			withProviders: true,
		});

		await expect(screen.findByTestId("LedgerConfirmation-description")).resolves.toBeVisible();

		await waitFor(() => expect(screen.queryByTestId("AuthenticationStep__mnemonic")).toBeNull());
		await waitFor(() => expect(screen.queryByTestId(secondMnemonicID)).toBeNull());

		expect(asFragment()).toMatchSnapshot();

		vi.clearAllMocks();
	});

	it("should specify ledger supported model", async () => {
		mockNanoXTransport();
		vi.spyOn(wallet, "isLedger").mockReturnValueOnce(true);

		const { asFragment } = renderWithForm(
			<AuthenticationStep
				subject={subject}
				ledgerIsAwaitingApp={false}
				ledgerIsAwaitingDevice={true}
				ledgerConnectedModel={Contracts.WalletLedgerModel.NanoS}
				ledgerSupportedModels={[Contracts.WalletLedgerModel.NanoX]}
				wallet={wallet}
			/>,
			{
				withProviders: true,
			},
		);

		await waitFor(() => expect(screen.queryByTestId("AuthenticationStep__mnemonic")).toBeNull());

		expect(screen.queryByTestId(secondMnemonicID)).toBeNull();
		expect(asFragment()).toMatchSnapshot();

		vi.clearAllMocks();
	});

	it("should show ledger waiting device screen", async () => {
		mockNanoXTransport();
		vi.spyOn(wallet, "isLedger").mockReturnValueOnce(true);

		const { asFragment } = renderWithForm(
			<AuthenticationStep subject={subject} wallet={wallet} ledgerIsAwaitingDevice={true} />,
			{
				withProviders: true,
			},
		);

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();
		await expect(screen.findByTestId("LedgerWaitingDevice-loading_message")).resolves.toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();

		vi.restoreAllMocks();
	});

	it("should not show ledger confirmation", async () => {
		mockNanoXTransport();
		vi.spyOn(wallet, "isLedger").mockReturnValueOnce(true);

		renderWithForm(<AuthenticationStep subject={subject} wallet={wallet} requireLedgerConfirmation={false} />, {
			withProviders: true,
		});

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await waitFor(() => {
			expect(screen.queryByTestId("LedgerConfirmation-description")).not.toBeInTheDocument();
		});

		vi.restoreAllMocks();
	});

	it("should show ledger waiting device screen for Nano X", async () => {
		mockNanoXTransport();
		vi.spyOn(wallet, "isLedger").mockReturnValueOnce(true);

		const { asFragment } = renderWithForm(
			<AuthenticationStep
				subject={subject}
				ledgerIsAwaitingDevice={false}
				ledgerIsAwaitingApp={false}
				ledgerSupportedModels={[Contracts.WalletLedgerModel.NanoX]}
				wallet={wallet}
			/>,
			{
				withProviders: true,
			},
		);

		await expect(screen.findByTestId("LedgerConfirmation-description")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		vi.restoreAllMocks();
	});

	it("should show ledger waiting device screen for Nano S", async () => {
		mockNanoSTransport();
		vi.spyOn(wallet, "isLedger").mockReturnValueOnce(true);

		const { asFragment } = renderWithForm(
			<AuthenticationStep
				subject={subject}
				ledgerIsAwaitingDevice={false}
				ledgerIsAwaitingApp={false}
				ledgerSupportedModels={[Contracts.WalletLedgerModel.NanoS]}
				wallet={wallet}
			/>,
			{
				withProviders: true,
			},
		);

		await expect(screen.findByTestId("LedgerConfirmation-description")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		vi.restoreAllMocks();
	});

	it("should show ledger waiting app screen", async () => {
		mockNanoXTransport();
		vi.spyOn(wallet, "isLedger").mockReturnValueOnce(true);

		const { asFragment } = renderWithForm(
			<AuthenticationStep
				subject={subject}
				ledgerIsAwaitingDevice={false}
				ledgerIsAwaitingApp={true}
				ledgerSupportedModels={[Contracts.WalletLedgerModel.NanoX]}
				wallet={wallet}
			/>,
			{
				withProviders: true,
			},
		);

		// eslint-disable-next-line testing-library/prefer-explicit-assert
		await screen.findByTestId("LedgerWaitingApp-loading_message");

		expect(asFragment()).toMatchSnapshot();

		vi.clearAllMocks();
	});

	it("should handle ledger error", async () => {
		mockLedgerTransportError("Access denied to use Ledger device");

		vi.spyOn(wallet, "isLedger").mockReturnValueOnce(true);

		renderWithForm(<AuthenticationStep subject={subject} wallet={wallet} />, {
			withProviders: true,
		});

		await waitFor(() => expect(goMock).toHaveBeenCalledWith(-1));

		vi.clearAllMocks();
	});

	it("should render with encryption password input", async () => {
		mockNanoXTransport();
		vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);
		vi.spyOn(wallet, "actsWithWifWithEncryption").mockReturnValue(true);
		vi.spyOn(wallet.signingKey(), "get").mockReturnValue(PBKDF2.encrypt(getDefaultWalletMnemonic(), "password"));

		renderWithForm(<AuthenticationStep subject={subject} wallet={wallet} />, { withProviders: true });

		await expect(screen.findByTestId("AuthenticationStep__encryption-password")).resolves.toBeVisible();

		vi.clearAllMocks();
	});
});
