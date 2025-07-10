import { Contracts } from "@/app/lib/profiles";
import { PBKDF2 } from "@ardenthq/arkvault-crypto";
import userEvent from "@testing-library/user-event";
import React from "react";
import { AuthenticationStep } from "./AuthenticationStep";
import {
	env,
	getDefaultProfileId,
	MAINSAIL_MNEMONICS,
	renderWithForm,
	screen,
	waitFor,
	mockNanoXTransport,
	mockNanoSTransport,
	mockLedgerTransportError,
	getDefaultWalletMnemonic,
	LocationTracker,
	test,
} from "@/utils/testing-library";

vi.mock(
	"react-rsrc/domains/transaction/components/AuthenticationStep/AuthenticationStep.test.tsxouter-dom",
	async () => ({
		...(await vi.importActual("react-router-dom")),
	}),
);

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

describe.each(["transaction", "message"])("AuthenticationStep (%s)", (subject) => {
	let profile: Contracts.IProfile;
	const mnemonicMismatchError = "This mnemonic does not correspond to your wallet";

	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should validate if mnemonic match the wallet address", async () => {
		const wallet = await profile.walletFactory().fromMnemonicWithBIP39({ mnemonic: MAINSAIL_MNEMONICS[0] });

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
		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), MAINSAIL_MNEMONICS[0]);

		await waitFor(() => expect(form()?.formState.isValid).toBeTruthy());

		profile.wallets().forget(wallet.id());
		vi.clearAllMocks();
	});

	it("should request mnemonic if wallet was imported using mnemonic", async () => {
		const wallet = await profile.walletFactory().fromMnemonicWithBIP39({ mnemonic: MAINSAIL_MNEMONICS[0] });
		await wallet.synchroniser().identity();

		const { form, asFragment } = renderWithForm(<AuthenticationStep subject={subject} wallet={wallet} />, {
			withProviders: true,
		});

		expect(screen.getByTestId("AuthenticationStep__mnemonic")).toBeInTheDocument();

		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), MAINSAIL_MNEMONICS[0]);

		await waitFor(() => expect(form()?.getValues()).toStrictEqual({ mnemonic: MAINSAIL_MNEMONICS[0] }));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should request secret if wallet was imported using secret", async () => {
		const wallet = profile.wallets().first();
		vi.spyOn(wallet, "actsWithSecret").mockReturnValue(true);
		vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);

		const { form, asFragment } = renderWithForm(<AuthenticationStep subject={subject} wallet={wallet} />, {
			withProviders: true,
		});

		expect(screen.getByTestId("AuthenticationStep__secret")).toBeInTheDocument();

		await userEvent.type(screen.getByTestId("AuthenticationStep__secret"), "secret");

		await waitFor(() => expect(form()?.getValues()).toStrictEqual({ secret: "secret" }));

		expect(asFragment()).toMatchSnapshot();
	});

	test("should request mnemonic if wallet was imported using address", async () => {
		const wallet = profile.wallets().first();
		vi.spyOn(wallet, "actsWithAddress").mockReturnValue(true);
		vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);

		const { form, asFragment } = renderWithForm(<AuthenticationStep subject={subject} wallet={wallet} />, {
			withProviders: true,
		});

		expect(screen.getByTestId("AuthenticationStep__mnemonic")).toBeInTheDocument();

		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), MAINSAIL_MNEMONICS[0]);

		await waitFor(() => expect(form()?.getValues()).toStrictEqual({ mnemonic: MAINSAIL_MNEMONICS[0] }));

		expect(asFragment()).toMatchSnapshot();
	});

	test("should show only ledger confirmation", async ({ defaultWallet }) => {
		mockNanoXTransport();
		vi.spyOn(defaultWallet, "isLedger").mockReturnValueOnce(true);

		const { asFragment } = renderWithForm(<AuthenticationStep subject={subject} wallet={defaultWallet} />, {
			withProviders: true,
		});

		await expect(screen.findByTestId("LedgerConfirmation-description")).resolves.toBeVisible();

		await waitFor(() => expect(screen.queryByTestId("AuthenticationStep__mnemonic")).toBeNull());

		expect(asFragment()).toMatchSnapshot();

		vi.clearAllMocks();
	});

	test("should specify ledger supported model", async ({ defaultWallet }) => {
		mockNanoXTransport();
		vi.spyOn(defaultWallet, "isLedger").mockReturnValueOnce(true);

		const { asFragment } = renderWithForm(
			<AuthenticationStep
				subject={subject}
				ledgerIsAwaitingApp={false}
				ledgerIsAwaitingDevice={true}
				ledgerConnectedModel={Contracts.WalletLedgerModel.NanoS}
				ledgerSupportedModels={[Contracts.WalletLedgerModel.NanoX]}
				wallet={defaultWallet}
			/>,
			{
				withProviders: true,
			},
		);

		await waitFor(() => expect(screen.queryByTestId("AuthenticationStep__mnemonic")).toBeNull());

		await waitFor(() => expect(screen.queryByTestId("header__title")).toHaveTextContent(/Ledger Wallet/));

		expect(asFragment()).toMatchSnapshot();

		vi.clearAllMocks();
	});

	test("should show ledger waiting device screen", async ({ defaultWallet }) => {
		mockNanoXTransport();
		vi.spyOn(defaultWallet, "isLedger").mockReturnValueOnce(true);

		const { asFragment } = renderWithForm(
			<AuthenticationStep subject={subject} wallet={defaultWallet} ledgerIsAwaitingDevice={true} />,
			{
				withProviders: true,
			},
		);

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();
		await expect(screen.findByTestId("LedgerWaitingDevice-loading_message")).resolves.toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();

		vi.restoreAllMocks();
	});

	test("should not show ledger confirmation", async ({ defaultWallet }) => {
		mockNanoXTransport();
		vi.spyOn(defaultWallet, "isLedger").mockReturnValueOnce(true);

		renderWithForm(
			<AuthenticationStep subject={subject} wallet={defaultWallet} requireLedgerConfirmation={false} />,
			{
				withProviders: true,
			},
		);

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await waitFor(() => {
			expect(screen.queryByTestId("LedgerConfirmation-description")).not.toBeInTheDocument();
		});

		vi.restoreAllMocks();
	});

	test("should show ledger waiting device screen for Nano X", async ({ defaultWallet }) => {
		mockNanoXTransport();
		vi.spyOn(defaultWallet, "isLedger").mockReturnValueOnce(true);

		const { asFragment } = renderWithForm(
			<AuthenticationStep
				subject={subject}
				ledgerIsAwaitingDevice={false}
				ledgerIsAwaitingApp={false}
				ledgerSupportedModels={[Contracts.WalletLedgerModel.NanoX]}
				wallet={defaultWallet}
			/>,
			{
				withProviders: true,
			},
		);

		await expect(screen.findByTestId("LedgerConfirmation-description")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		vi.restoreAllMocks();
	});

	test("should show ledger waiting device screen for Nano S", async ({ defaultWallet }) => {
		mockNanoSTransport();
		vi.spyOn(defaultWallet, "isLedger").mockReturnValueOnce(true);

		const { asFragment } = renderWithForm(
			<AuthenticationStep
				subject={subject}
				ledgerIsAwaitingDevice={false}
				ledgerIsAwaitingApp={false}
				ledgerSupportedModels={[Contracts.WalletLedgerModel.NanoS]}
				wallet={defaultWallet}
			/>,
			{
				withProviders: true,
			},
		);

		await expect(screen.findByTestId("LedgerConfirmation-description")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		vi.restoreAllMocks();
	});

	test("should show ledger waiting app screen", async ({ defaultWallet }) => {
		mockNanoXTransport();
		vi.spyOn(defaultWallet, "isLedger").mockReturnValueOnce(true);

		const { asFragment } = renderWithForm(
			<AuthenticationStep
				subject={subject}
				ledgerIsAwaitingDevice={false}
				ledgerIsAwaitingApp={true}
				ledgerSupportedModels={[Contracts.WalletLedgerModel.NanoX]}
				wallet={defaultWallet}
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

	test("should handle ledger error", async ({ defaultWallet }) => {
		let location: Location | undefined;

		vi.spyOn(defaultWallet, "isLedger").mockReturnValueOnce(true);
		mockLedgerTransportError("No transports appear to be supported.");

		renderWithForm(
			<>
				<LocationTracker onLocationChange={(currentLocation) => (location = currentLocation)} />
				<AuthenticationStep subject={subject} wallet={defaultWallet} />
			</>,
			{
				withProviders: true,
			},
		);

		await waitFor(() => expect(location?.pathname).toBe("/"));

		vi.clearAllMocks();
	});

	test("should render with encryption password input", async () => {
		const wallet = profile.wallets().first();
		mockNanoXTransport();

		vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);
		vi.spyOn(wallet, "actsWithSecretWithEncryption").mockReturnValue(true);
		vi.spyOn(wallet.signingKey(), "get").mockReturnValue(PBKDF2.encrypt(getDefaultWalletMnemonic(), "password"));
		renderWithForm(<AuthenticationStep subject={subject} wallet={wallet} />, { withProviders: true });

		await expect(screen.findByTestId("AuthenticationStep__encryption-password")).resolves.toBeVisible();

		vi.clearAllMocks();
	});

	test("should render with second mnemonic", async () => {
		const wallet = profile.wallets().first();
		mockNanoXTransport();

		vi.spyOn(wallet, "actsWithSecret").mockReturnValue(false);
		vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(true);
		vi.spyOn(wallet, "isSecondSignature").mockReturnValue(true);
		renderWithForm(<AuthenticationStep subject="transaction" wallet={wallet} />, { withProviders: true });

		await expect(screen.findByTestId("AuthenticationStep__second-mnemonic")).resolves.toBeVisible();

		vi.clearAllMocks();
	});

	test("should render with second secret", async () => {
		const wallet = profile.wallets().first();
		mockNanoXTransport();

		vi.spyOn(wallet, "actsWithSecret").mockReturnValue(true);
		vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);
		vi.spyOn(wallet, "isSecondSignature").mockReturnValue(true);
		renderWithForm(<AuthenticationStep subject="transaction" wallet={wallet} />, { withProviders: true });

		await expect(screen.findByTestId("AuthenticationStep__second-secret")).resolves.toBeVisible();

		vi.clearAllMocks();
	});
});
