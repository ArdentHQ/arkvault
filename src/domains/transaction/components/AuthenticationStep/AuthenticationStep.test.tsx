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
} from "@/utils/testing-library";

const MainsailDevnet = "mainsail.devnet";

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
	let wallet: Contracts.IReadWriteWallet;
	let profile: Contracts.IProfile;
	const mnemonicMismatchError = "This mnemonic does not correspond to your wallet";

	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();
	});

	it("should validate if mnemonic match the wallet address", async () => {
		wallet = await profile.walletFactory().fromMnemonicWithBIP39({ mnemonic: MAINSAIL_MNEMONICS[0] });

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
		wallet = await profile.walletFactory().fromMnemonicWithBIP39({ mnemonic: MAINSAIL_MNEMONICS[2] });

		const { form, asFragment } = renderWithForm(<AuthenticationStep subject={subject} wallet={wallet} />, {
			withProviders: true,
		});

		expect(screen.getByTestId("AuthenticationStep__mnemonic")).toBeInTheDocument();

		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), MAINSAIL_MNEMONICS[0]);

		await waitFor(() => expect(form()?.getValues()).toStrictEqual({ mnemonic: MAINSAIL_MNEMONICS[0] }));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should request secret if wallet was imported using secret", async () => {
		wallet = await profile.walletFactory().fromSecret({ secret: "secret" });

		const { form, asFragment } = renderWithForm(<AuthenticationStep subject={subject} wallet={wallet} />, {
			withProviders: true,
		});

		expect(screen.getByTestId("AuthenticationStep__secret")).toBeInTheDocument();

		await userEvent.type(screen.getByTestId("AuthenticationStep__secret"), "secret");

		await waitFor(() => expect(form()?.getValues()).toStrictEqual({ secret: "secret" }));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should request mnemonic if wallet was imported using address", async () => {
		wallet = await profile.walletFactory().fromAddress({
			address: "DJpFwW39QnQvQRQJF2MCfAoKvsX4DJ28jq",
			coin: "Mainsail",
			network: MainsailDevnet,
		});

		const { form, asFragment } = renderWithForm(<AuthenticationStep subject={subject} wallet={wallet} />, {
			withProviders: true,
		});

		expect(screen.getByTestId("AuthenticationStep__mnemonic")).toBeInTheDocument();

		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), MAINSAIL_MNEMONICS[0]);

		await waitFor(() => expect(form()?.getValues()).toStrictEqual({ mnemonic: MAINSAIL_MNEMONICS[0] }));

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

		await waitFor(() => expect(screen.queryByTestId("header__title")).toHaveTextContent(/Ledger Wallet/));

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
		let location: Location | undefined;

		vi.spyOn(wallet, "isLedger").mockReturnValueOnce(true);

		renderWithForm(
			<>
				<LocationTracker onLocationChange={(currentLocation) => (location = currentLocation)} />
				<AuthenticationStep subject={subject} wallet={wallet} />
			</>,
			{
				withProviders: true,
			},
		);

		await waitFor(() => expect(location?.pathname).toBe("/"));

		vi.clearAllMocks();
	});

	it("should render with encryption password input", async () => {
		mockNanoXTransport();

		vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);
		vi.spyOn(wallet, "actsWithSecretWithEncryption").mockReturnValue(true);
		vi.spyOn(wallet.signingKey(), "get").mockReturnValue(PBKDF2.encrypt(getDefaultWalletMnemonic(), "password"));
		renderWithForm(<AuthenticationStep subject={subject} wallet={wallet} />, { withProviders: true });

		await expect(screen.findByTestId("AuthenticationStep__encryption-password")).resolves.toBeVisible();

		vi.clearAllMocks();
	});
});
