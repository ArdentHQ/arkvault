/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { SignMessage } from "./SignMessage";
import { translations as messageTranslations } from "@/domains/message/i18n";
import {
	env,
	getDefaultProfileId,
	MNEMONICS,
	render,
	renderResponsiveWithRoute,
	screen,
	waitFor,
	mockNanoXTransport,
	mockLedgerTransportError,
} from "@/utils/testing-library";

const history = createHashHistory();

const walletUrl = (walletId: string) => `/profiles/${getDefaultProfileId()}/wallets/${walletId}/sign-message`;

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let secondWallet: Contracts.IReadWriteWallet;

const mnemonic = MNEMONICS[0];

const continueButton = () => screen.getByTestId("SignMessage__continue-button");
const signButton = () => screen.getByTestId("SignMessage__sign-button");
const messageInput = () => screen.getByTestId("SignMessage__message-input");

const signMessage = "Hello World";

const expectHeading = async (text: string) => {
	await expect(screen.findByRole("heading", { name: text })).resolves.toBeVisible();
};

describe("SignMessage", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		wallet = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic,
			network: "ark.devnet",
		});
		profile.wallets().push(wallet);

		secondWallet = await profile.walletFactory().fromAddress({
			address: "DCX2kvwgL2mrd9GjyYAbfXLGGXWwgN3Px7",
			coin: "ARK",
			network: "ark.devnet",
		});
		profile.wallets().push(secondWallet);
	});

	beforeEach(() => history.push(walletUrl(wallet.id())));

	it("should render", async () => {
		await wallet.synchroniser().identity();

		const { asFragment } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/sign-message">
				<SignMessage />
			</Route>,
			{
				history,
				route: walletUrl(wallet.id()),
			},
		);

		await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

		expect(messageInput()).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render for ledger wallets", async () => {
		const isLedgerMock = jest.spyOn(wallet, "isLedger").mockReturnValue(true);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/sign-message">
				<SignMessage />
			</Route>,
			{
				history,
				route: walletUrl(wallet.id()),
			},
		);

		await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

		expect(messageInput()).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();

		isLedgerMock.mockRestore();
	});

	it("should show waiting state for ledger if device available but not connected", async () => {
		const isLedgerMock = jest.spyOn(wallet, "isLedger").mockReturnValue(true);

		mockNanoXTransport();

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/sign-message">
				<SignMessage />
			</Route>,
			{
				history,
				route: walletUrl(wallet.id()),
			},
		);

		await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

		userEvent.paste(messageInput(), signMessage);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		userEvent.click(continueButton());

		await expect(screen.findByTestId("LedgerWaitingAppContent")).resolves.toBeVisible();

		isLedgerMock.mockRestore();
	});

	it("should render with mnemonic field for a wallet that has been imported with address", async () => {
		history.push(walletUrl(secondWallet.id()));

		await secondWallet.synchroniser().identity();

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/sign-message">
				<SignMessage />
			</Route>,
			{
				history,
				route: walletUrl(secondWallet.id()),
			},
		);

		await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

		userEvent.paste(messageInput(), signMessage);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		userEvent.click(continueButton());

		expect(screen.getByTestId("AuthenticationStep__mnemonic")).toBeInTheDocument();

		await waitFor(() => expect(signButton()).toBeDisabled());
	});

	it.each(["xs", "lg"])("should sign message (%s)", async (breakpoint) => {
		const signedMessage = {
			message: signMessage,
			signatory: "03d7001f0cfff639c0e458356581c919d5885868f14f72ba3be74c8f105cce34ac",
			signature:
				"e16e8badc6475e2eb4eb814fa0ae434e9ca2240b6131f3bf560969989366baa270786fb87ae2fe2945d60408cedc0a757768ebc768b03bf78e5e9b7a20291ac6",
		};

		renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/wallets/:walletId/sign-message">
				<SignMessage />
			</Route>,
			breakpoint,
			{
				history,
				route: walletUrl(wallet.id()),
			},
		);

		await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

		expect(
			screen.getByText(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_MNEMONIC),
		).toBeInTheDocument();

		userEvent.paste(messageInput(), signMessage);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		userEvent.click(continueButton());

		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), mnemonic);

		await waitFor(() => expect(signButton()).toBeEnabled());

		userEvent.click(signButton());

		await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.SUCCESS_STEP.TITLE);

		const writeTextMock = jest.fn();
		const clipboardOriginal = navigator.clipboard;

		// @ts-ignore
		navigator.clipboard = { writeText: writeTextMock };

		userEvent.click(screen.getByTestId("SignMessage__copy-button"));

		await waitFor(() => expect(writeTextMock).toHaveBeenCalledWith(JSON.stringify(signedMessage)));

		// @ts-ignore
		navigator.clipboard = clipboardOriginal;
	});

	it("should sign message with encryption password", async () => {
		const encryptedWallet = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: MNEMONICS[5],
			network: "ark.devnet",
			password: "password",
		});

		profile.wallets().push(encryptedWallet);

		history.push(walletUrl(encryptedWallet.id()));

		const { asFragment } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/sign-message">
				<SignMessage />
			</Route>,
			{
				history,
				route: walletUrl(encryptedWallet.id()),
			},
		);

		await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

		expect(
			screen.getByText(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_ENCRYPTION_PASSWORD),
		).toBeInTheDocument();

		userEvent.paste(messageInput(), signMessage);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		userEvent.click(continueButton());

		userEvent.paste(screen.getByTestId("AuthenticationStep__encryption-password"), "password");

		await waitFor(() =>
			expect(screen.getByTestId("AuthenticationStep__encryption-password")).toHaveValue("password"),
		);

		await waitFor(() => expect(signButton()).toBeEnabled());

		userEvent.click(signButton());

		await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.SUCCESS_STEP.TITLE);

		expect(asFragment()).toMatchSnapshot();

		profile.wallets().forget(encryptedWallet.id());
	});

	it("should sign message with secret", async () => {
		const isLedgerMock = jest.spyOn(wallet, "isLedger").mockReturnValue(false);
		const walletHasSigningKey = jest.spyOn(wallet.signingKey(), "exists").mockReturnValue(false);
		const walletActsWithSecret = jest.spyOn(wallet, "actsWithSecret").mockReturnValue(true);
		const walletActsWithMnemonic = jest.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);
		const walletActsWithWithEncryption = jest
			.spyOn(wallet, "actsWithMnemonicWithEncryption")
			.mockReturnValue(false);
		const fromSecret = jest.spyOn(wallet.coin().address(), "fromSecret").mockResolvedValue({
			address: wallet.address(),
			type: "bip39",
		});

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/sign-message">
				<SignMessage />
			</Route>,
			{
				history,
				route: walletUrl(wallet.id()),
			},
		);

		await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

		expect(
			screen.getByText(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_SECRET),
		).toBeInTheDocument();

		userEvent.paste(messageInput(), signMessage);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		userEvent.click(continueButton());

		userEvent.paste(screen.getByTestId("AuthenticationStep__secret"), "secret");

		await waitFor(() => expect(signButton()).toBeEnabled());

		userEvent.click(signButton());

		await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.SUCCESS_STEP.TITLE);

		isLedgerMock.mockRestore();
		walletHasSigningKey.mockRestore();
		walletActsWithSecret.mockRestore();
		walletActsWithMnemonic.mockRestore();
		walletActsWithWithEncryption.mockRestore();
		fromSecret.mockRestore();
	});

	it("should sign message with a ledger wallet", async () => {
		const isLedgerMock = jest.spyOn(wallet, "isLedger").mockReturnValue(true);

		const signMessageSpy = jest
			.spyOn(wallet.coin().ledger(), "signMessage")
			.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve("signature"), 300)));

		const publicKeyPaths = new Map([
			["m/44'/111'/0'/0/0", "027716e659220085e41389efc7cf6a05f7f7c659cf3db9126caabce6cda9156582"],
			["m/44'/111'/1'/0/0", wallet.publicKey()!],
			["m/44'/111'/2'/0/0", "020aac4ec02d47d306b394b79d3351c56c1253cd67fe2c1a38ceba59b896d584d1"],
		]);

		const getPublicKeyMock = jest
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockResolvedValue(publicKeyPaths.values().next().value);

		const getVersionMock = jest.spyOn(wallet.coin().ledger(), "getVersion").mockResolvedValue("2.1.0");

		const ledgerListenMock = mockNanoXTransport();

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/sign-message">
				<SignMessage />
			</Route>,
			{
				history,
				route: walletUrl(wallet.id()),
			},
		);

		await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

		expect(
			screen.getByText(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_LEDGER),
		).toBeInTheDocument();

		userEvent.paste(messageInput(), signMessage);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		userEvent.click(continueButton());

		await waitFor(() => expect(getPublicKeyMock).toHaveBeenCalledWith("m/44'/1'/0'/0/0"));

		signMessageSpy.mockRestore();
		isLedgerMock.mockRestore();
		ledgerListenMock.mockRestore();
		getVersionMock.mockRestore();
		getPublicKeyMock.mockRestore();
	});

	it("should display error step if user rejects", async () => {
		const isLedgerMock = jest.spyOn(wallet, "isLedger").mockReturnValue(true);

		const consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => void 0);

		const signMessageSpy = jest.spyOn(wallet.coin().ledger(), "signMessage").mockImplementation(() => {
			throw new Error("Condition of use not satisfied");
		});

		const getVersionMock = jest.spyOn(wallet.coin().ledger(), "getVersion").mockResolvedValue("2.1.0");

		const getPublicKeySpy = jest
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockResolvedValue(wallet.publicKey()!);

		const ledgerListenMock = mockNanoXTransport();

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/sign-message">
				<SignMessage />
			</Route>,
			{
				history,
				route: walletUrl(wallet.id()),
			},
		);

		await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

		userEvent.paste(messageInput(), signMessage);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		userEvent.click(continueButton());

		await waitFor(() => expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.ERROR_STEP.TITLE));

		signMessageSpy.mockRestore();
		isLedgerMock.mockRestore();
		ledgerListenMock.mockRestore();
		getPublicKeySpy.mockRestore();
		consoleErrorMock.mockRestore();
		getVersionMock.mockRestore();
	});

	it("should display error step if ledger is not found in time", async () => {
		const isLedgerMock = jest.spyOn(wallet, "isLedger").mockReturnValue(true);
		const consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => void 0);

		const ledgerListenMock = mockLedgerTransportError("no device found");

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/sign-message">
				<SignMessage />
			</Route>,
			{
				history,
				route: walletUrl(wallet.id()),
			},
		);

		await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

		userEvent.paste(messageInput(), signMessage);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		userEvent.click(continueButton());

		await waitFor(() => expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.ERROR_STEP.TITLE));

		isLedgerMock.mockRestore();
		ledgerListenMock.mockRestore();
		consoleErrorMock.mockRestore();
	});
});
