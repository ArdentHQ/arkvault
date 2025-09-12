import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterAll, expect, vi, MockInstance } from "vitest";
import { translations as messageTranslations } from "@/domains/message/i18n";
import {
	env,
	render,
	screen,
	waitFor,
	mockNanoXTransport,
	triggerMessageSignOnce,
	MAINSAIL_MNEMONICS,
} from "@/utils/testing-library";
import { SignMessageSidePanel } from "./SignMessageSidePanel";
import * as ReactRouter from "react-router";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let useSearchParamsMock: MockInstance;

const mnemonic = MAINSAIL_MNEMONICS[0];

const continueButton = () => screen.getByTestId("SignMessage__continue-button");
const messageInput = () => screen.getByTestId("SignMessage__message-input");

const signMessage = "Hello World";

const expectHeading = async (text: string) => {
	await waitFor(() => {
		expect(screen.getByTestId("SidePanel__title")).toHaveTextContent(text);
	});
};

describe("SignMessage with ledger", () => {
	let dashboardRoute: string | undefined;
	beforeAll(async () => {
		useSearchParamsMock = vi
			.spyOn(ReactRouter, "useSearchParams")
			.mockReturnValue([new URLSearchParams(), vi.fn()]);

		profile = await env.profiles().create("Test");

		wallet = await profile.walletFactory().fromMnemonicWithBIP39({
			mnemonic,
		});

		profile.wallets().push(wallet);

		await env.profiles().restore(profile);

		vi.spyOn(profile, "walletSelectionMode").mockReturnValue("multiple");

		await triggerMessageSignOnce(wallet);
	});

	afterAll(() => {
		env.profiles().forget(profile.id());
		useSearchParamsMock.mockRestore();
	});

	beforeEach(() => {
		dashboardRoute = `/profiles/${profile.id()}/dashboard`;
	});

	it("should display error step if user rejects", async () => {
		const isLedgerMock = vi.spyOn(wallet, "isLedger").mockReturnValue(true);

		const consoleErrorMock = vi.spyOn(console, "error").mockImplementation(() => void 0);

		const ledgerSpy = vi.spyOn(profile, "ledger").mockReturnValue({
			connect: vi.fn().mockResolvedValue(void 0),
			getPublicKey: vi.fn().mockResolvedValue(wallet.publicKey()!),
			getVersion: vi.fn().mockResolvedValue("2.1.0"),
			signMessage: vi.fn().mockImplementation(() => {
				throw new Error("Condition of use not satisfied");
			}),
			slip44: vi.fn().mockReturnValue(111),
		});

		const ledgerListenMock = mockNanoXTransport();

		const onOpenChangeMock = vi.fn();

		render(<SignMessageSidePanel open={true} onOpenChange={onOpenChangeMock} />, {
			route: dashboardRoute,
		});

		await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

		// The profile only have one address so we dont need to select any address
		await userEvent.type(messageInput(), signMessage);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await userEvent.click(continueButton());

		await waitFor(() => expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.ERROR_STEP.TITLE));

		await waitFor(() => {
			expect(screen.getByTestId("ErrorStep__close-button")).toBeInTheDocument();
		});

		await userEvent.click(screen.getByTestId("ErrorStep__close-button"));

		expect(onOpenChangeMock).toHaveBeenCalledWith(false);

		ledgerSpy.mockRestore();
		isLedgerMock.mockRestore();
		consoleErrorMock.mockRestore();
		ledgerListenMock.mockRestore();
	});

	it.skip("should sign message with a ledger wallet", async () => {
		const isLedgerMock = vi.spyOn(wallet, "isLedger").mockReturnValue(true);

		const signMessageSpy = vi
			.spyOn(wallet.ledger(), "signMessage")
			.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve("signature"), 300)));

		const publicKeyPaths = new Map([
			["m/44'/111'/0'/0/0", "027716e659220085e41389efc7cf6a05f7f7c659cf3db9126caabce6cda9156582"],
			["m/44'/111'/1'/0/0", wallet.publicKey()!],
			["m/44'/111'/2'/0/0", "020aac4ec02d47d306b394b79d3351c56c1253cd67fe2c1a38ceba59b896d584d1"],
		]);

		const getPublicKeyMock = vi
			.spyOn(wallet.ledger(), "getPublicKey")
			.mockResolvedValue(publicKeyPaths.values().next().value);

		const getVersionMock = vi.spyOn(wallet.ledger(), "getVersion").mockResolvedValue("2.1.0");

		const ledgerListenMock = mockNanoXTransport();

		render(<SignMessageSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: dashboardRoute,
		});

		await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

		// The profile only have one address so we dont need to select any address

		expect(
			screen.getByText(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_LEDGER),
		).toBeInTheDocument();

		await userEvent.type(messageInput(), signMessage);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await userEvent.click(continueButton());

		await waitFor(() => expect(getPublicKeyMock).toHaveBeenCalledWith("m/44'/1'/0'/0/0"));

		await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.SUCCESS_STEP.TITLE);

		signMessageSpy.mockRestore();
		isLedgerMock.mockRestore();
		ledgerListenMock.mockRestore();
		getVersionMock.mockRestore();
		getPublicKeyMock.mockRestore();
	});
	//
});
