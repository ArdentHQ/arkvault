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
	screen,
	waitFor,
	mockNanoXTransport,
	triggerMessageSignOnce, generateHistoryCalledWith,
} from "@/utils/testing-library";

const history = createHashHistory();

const walletUrl = (walletId: string) => `/profiles/${getDefaultProfileId()}/wallets/${walletId}/sign-message`;

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

const mnemonic = MNEMONICS[0];

const continueButton = () => screen.getByTestId("SignMessage__continue-button");
const messageInput = () => screen.getByTestId("SignMessage__message-input");

const signMessage = "Hello World";

const expectHeading = async (text: string) => {
	await waitFor(() => {
		expect(screen.findByRole("heading", { name: text })).toBeDefined();
	});
};

describe("SignMessage with ledger", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		wallet = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic,
			network: "ark.devnet",
		});

		profile.wallets().push(wallet);

		profile.coins().set("ARK", "ark.devnet");

		await triggerMessageSignOnce(wallet);
	});

	beforeEach(() => {
		history.push(walletUrl(wallet.id()));
	});

	it("should display error step if user rejects", async () => {
		const isLedgerMock = vi.spyOn(wallet, "isLedger").mockReturnValue(true);

		const consoleErrorMock = vi.spyOn(console, "error").mockImplementation(() => void 0);

		const signMessageSpy = vi.spyOn(wallet.coin().ledger(), "signMessage").mockImplementation(() => {
			throw new Error("Condition of use not satisfied");
		});

		const getVersionMock = vi.spyOn(wallet.coin().ledger(), "getVersion").mockResolvedValue("2.1.0");

		const getPublicKeySpy = vi.spyOn(wallet.coin().ledger(), "getPublicKey").mockResolvedValue(wallet.publicKey()!);

		const ledgerListenMock = mockNanoXTransport();

		render(<Route path="/profiles/:profileId/wallets/:walletId/sign-message" element={<SignMessage />}></Route>, {
			history,
			route: walletUrl(wallet.id()),
		});

		await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

		userEvent.paste(messageInput(), signMessage);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		userEvent.click(continueButton());

		await waitFor(() => expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.ERROR_STEP.TITLE));

		const historySpy = vi.spyOn(history, "push");

		await waitFor(() => {
			expect(screen.getByTestId("ErrorStep__close-button")).toBeInTheDocument();
		});

		userEvent.click(screen.getByTestId("ErrorStep__close-button"));

		expect(historySpy).toHaveBeenCalledWith(...generateHistoryCalledWith({pathname: `/profiles/${profile.id()}/wallets/${wallet.id()}`}));

		historySpy.mockRestore();

		signMessageSpy.mockRestore();
		isLedgerMock.mockRestore();
		ledgerListenMock.mockRestore();
		getPublicKeySpy.mockRestore();
		consoleErrorMock.mockRestore();
		getVersionMock.mockRestore();
	});

	it("should sign message with a ledger wallet", async () => {
		const isLedgerMock = vi.spyOn(wallet, "isLedger").mockReturnValue(true);

		const signMessageSpy = vi
			.spyOn(wallet.coin().ledger(), "signMessage")
			.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve("signature"), 300)));

		const publicKeyPaths = new Map([
			["m/44'/111'/0'/0/0", "027716e659220085e41389efc7cf6a05f7f7c659cf3db9126caabce6cda9156582"],
			["m/44'/111'/1'/0/0", wallet.publicKey()!],
			["m/44'/111'/2'/0/0", "020aac4ec02d47d306b394b79d3351c56c1253cd67fe2c1a38ceba59b896d584d1"],
		]);

		const getPublicKeyMock = vi
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockResolvedValue(publicKeyPaths.values().next().value);

		const getVersionMock = vi.spyOn(wallet.coin().ledger(), "getVersion").mockResolvedValue("2.1.0");

		const ledgerListenMock = mockNanoXTransport();

		render(<Route path="/profiles/:profileId/wallets/:walletId/sign-message" element={<SignMessage />}></Route>, {
			history,
			route: walletUrl(wallet.id()),
		});

		await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

		expect(
			screen.getByText(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_LEDGER),
		).toBeInTheDocument();

		userEvent.paste(messageInput(), signMessage);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		userEvent.click(continueButton());

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
