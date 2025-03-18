import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { SignMessage } from "./SignMessage";
import { translations as messageTranslations } from "@/domains/message/i18n";
import {
	env,
	getMainsailProfileId,
	render,
	renderResponsiveWithRoute,
	screen,
	waitFor,
	triggerMessageSignOnce,
	MAINSAIL_MNEMONICS,
} from "@/utils/testing-library";

const history = createHashHistory();

const walletUrl = (walletId: string) => `/profiles/${getMainsailProfileId()}/wallets/${walletId}/sign-message`;

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let wallet2: Contracts.IReadWriteWallet;

const mnemonic = MAINSAIL_MNEMONICS[0];

const continueButton = () => screen.getByTestId("SignMessage__continue-button");
const messageInput = () => screen.getByTestId("SignMessage__message-input");

const signMessage = "Hello World";

const expectHeading = async (text: string) => {
	await waitFor(() => {
		expect(screen.getByTestId("header__title")).toHaveTextContent(text);
	});
};

// Mock implementation of TextEncoder to always return Uint8Array.
vi.stubGlobal(
	"TextEncoder",
	class MockTextEncoder {
		encode(text) {
			return new Uint8Array([...text].map((character) => character.codePointAt(0)));
		}
	},
);

process.env.RESTORE_MAINSAIL_PROFILE = "true";
process.env.USE_MAINSAIL_NETWORK = "true";

describe("SignMessage", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		// wallet = profile.wallets().first();
		wallet = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "Mainsail",
			mnemonic,
			network: "mainsail.devnet",
		});

		wallet2 = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "Mainsail",
			mnemonic,
			network: "mainsail.mainnet",
		});

		profile.wallets().push(wallet);
		profile.wallets().push(wallet2);

		profile.coins().set("Mainsail", "mainsail.devnet");

		await triggerMessageSignOnce(wallet);
	});

	describe("Sign with Wallet", () => {
		beforeEach(() => {
			history.push(walletUrl(wallet.id()));
		});

		it.each(["xs", "lg"])("should render (%s)", async (breakpoint) => {
			await wallet.synchroniser().identity();

			const { asFragment } = renderResponsiveWithRoute(
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

			expect(messageInput()).toBeInTheDocument();

			expect(asFragment()).toMatchSnapshot();
		});

		it("should render for ledger wallets", async () => {
			const isLedgerMock = vi.spyOn(wallet, "isLedger").mockReturnValue(true);

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
			await expect(screen.findByTestId("AuthenticationStep__mnemonic")).rejects.toThrow(/Unable to find/);

			expect(messageInput()).toBeInTheDocument();

			isLedgerMock.mockRestore();
		});

		it("should sign message with mnemonic", async () => {
			const signedMessage = {
				message: signMessage,
				signatory: "0311b11b0dea8851d49af7c673d7032e37ee12307f9bbd379b64bbdac6ca302e84",
				signature:
					"345bc9b6111d11432032f6005391a98fb2d21b0358800406f3dcd05b5477730ab300c9f5707597903f1e9fa1b4f3db2a67f2c98fed09160cb4212080e82e21be",
			};

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
				screen.getByText(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_MNEMONIC),
			).toBeInTheDocument();

			await userEvent.type(messageInput(), signMessage);

			await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

			const mnemonicInput = screen.getByTestId("AuthenticationStep__mnemonic");
			await userEvent.type(mnemonicInput, "wrong");

			await waitFor(() => expect(continueButton()).toBeDisabled());

			await userEvent.clear(mnemonicInput);
			await userEvent.type(mnemonicInput, mnemonic);
			await waitFor(() => expect(continueButton()).toBeEnabled());

			await userEvent.click(continueButton());

			await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.SUCCESS_STEP.TITLE);

			const writeTextMock = vi.fn();
			const clipboardOriginal = navigator.clipboard;

			// @ts-ignore
			navigator.clipboard = { writeText: writeTextMock };

			await waitFor(() => {
				expect(screen.getByTestId("SignMessage__copy-button")).toBeInTheDocument();
			});

			await userEvent.click(screen.getByTestId("SignMessage__copy-button"));

			await waitFor(() => expect(writeTextMock).toHaveBeenCalledWith(JSON.stringify(signedMessage)));

			// @ts-ignore
			navigator.clipboard = clipboardOriginal;
		});

		it("should sign message with secret", async () => {
			const isLedgerMock = vi.spyOn(wallet, "isLedger").mockReturnValue(false);
			const walletHasSigningKey = vi.spyOn(wallet.signingKey(), "exists").mockReturnValue(false);
			const walletActsWithSecret = vi.spyOn(wallet, "actsWithSecret").mockReturnValue(true);
			const walletActsWithMnemonic = vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);
			const walletActsWithWithEncryption = vi
				.spyOn(wallet, "actsWithMnemonicWithEncryption")
				.mockReturnValue(false);
			const fromSecret = vi.spyOn(wallet.coin().address(), "fromSecret").mockResolvedValue({
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

			await userEvent.type(messageInput(), signMessage);

			await userEvent.type(screen.getByTestId("AuthenticationStep__secret"), "secret");

			await waitFor(() => {
				expect(screen.getByTestId("AuthenticationStep__secret")).toHaveValue("secret");
			});

			await waitFor(() => expect(continueButton()).toBeEnabled());
			await userEvent.click(continueButton());

			await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.SUCCESS_STEP.TITLE);

			isLedgerMock.mockRestore();
			walletHasSigningKey.mockRestore();
			walletActsWithSecret.mockRestore();
			walletActsWithMnemonic.mockRestore();
			walletActsWithWithEncryption.mockRestore();
			fromSecret.mockRestore();
		});

		it("should error and go back", async () => {
			const isLedgerMock = vi.spyOn(wallet, "isLedger").mockReturnValue(false);
			const walletHasSigningKey = vi.spyOn(wallet.signingKey(), "exists").mockReturnValue(false);
			const walletActsWithSecret = vi.spyOn(wallet, "actsWithSecret").mockReturnValue(true);
			const walletActsWithMnemonic = vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);
			const walletActsWithWithEncryption = vi
				.spyOn(wallet, "actsWithMnemonicWithEncryption")
				.mockReturnValue(false);
			const fromSecret = vi.spyOn(wallet.coin().address(), "fromSecret").mockResolvedValue({
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

			await userEvent.type(messageInput(), signMessage);

			await userEvent.type(screen.getByTestId("AuthenticationStep__secret"), "secret");

			await waitFor(() => {
				expect(screen.getByTestId("AuthenticationStep__secret")).toHaveValue("secret");
			});

			await waitFor(() => expect(continueButton()).toBeEnabled());

			vi.spyOn(wallet.message(), "sign").mockImplementation(() => {
				throw new Error("error");
			});

			await userEvent.click(continueButton());

			await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.ERROR_STEP.TITLE);

			await userEvent.click(screen.getByTestId("ErrorStep__back-button"));
			await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

			isLedgerMock.mockRestore();
			walletHasSigningKey.mockRestore();
			walletActsWithSecret.mockRestore();
			walletActsWithMnemonic.mockRestore();
			walletActsWithWithEncryption.mockRestore();
			fromSecret.mockRestore();
		});
	});
});
