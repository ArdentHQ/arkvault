/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

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
import { selectFirstAddress } from "./SignMessageSidePanel.test";

const history = createHashHistory();

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

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
	beforeAll(async () => {
		profile = await env.profiles().create("Test");

		wallet = await profile.walletFactory().fromMnemonicWithBIP39({
			mnemonic,
		});

		profile.wallets().push(wallet);

		await triggerMessageSignOnce(wallet);
	});

	afterAll(() => {
		env.profiles().forget(profile.id());
	});

	beforeEach(() => {
		const dashboardUrl = `/profiles/${profile.id()}/dashboard`;

		history.push(dashboardUrl);
	});

	it("should display error step if user rejects", async () => {
		const isLedgerMock = vi.spyOn(wallet, "isLedger").mockReturnValue(true);

		const consoleErrorMock = vi.spyOn(console, "error").mockImplementation(() => void 0);

		const signMessageSpy = vi.spyOn(wallet.ledger(), "signMessage").mockImplementation(() => {
			throw new Error("Condition of use not satisfied");
		});

		const getVersionMock = vi.spyOn(wallet.ledger(), "getVersion").mockResolvedValue("2.1.0");

		const getPublicKeySpy = vi.spyOn(wallet.ledger(), "getPublicKey").mockResolvedValue(wallet.publicKey()!);

		const ledgerListenMock = mockNanoXTransport();

		const onOpenChangeMock = vi.fn();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<SignMessageSidePanel open={true} onOpenChange={onOpenChangeMock} onMountChange={vi.fn()} />,
			</Route>,
			{
				history,
			},
		);

		await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

		await selectFirstAddress();

		await userEvent.type(messageInput(), signMessage);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await userEvent.click(continueButton());

		await waitFor(() => expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.ERROR_STEP.TITLE));

		await waitFor(() => {
			expect(screen.getByTestId("ErrorStep__close-button")).toBeInTheDocument();
		});

		await userEvent.click(screen.getByTestId("ErrorStep__close-button"));

		expect(onOpenChangeMock).toHaveBeenCalledWith(false);

		signMessageSpy.mockRestore();
		isLedgerMock.mockRestore();
		ledgerListenMock.mockRestore();
		getPublicKeySpy.mockRestore();
		consoleErrorMock.mockRestore();
		getVersionMock.mockRestore();
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

		render(
			<Route path="/profiles/:profileId/dashboard">
				<SignMessageSidePanel open={true} onOpenChange={onOpenChangeMock} onMountChange={vi.fn()} />,
			</Route>,
			{
				history,
			},
		);

		await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

		await selectFirstAddress();

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
