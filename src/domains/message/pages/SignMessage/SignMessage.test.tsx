import { Contracts } from "@/app/lib/profiles";
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
import {Crypto} from "@peculiar/webcrypto";
import { afterAll } from "vitest";

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

let cryptoStub;

describe("SignMessage", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		cryptoStub = vi.stubGlobal('crypto', {
			...globalThis.crypto,
			subtle: new Crypto().subtle,
		});

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

	afterAll(() => {
		cryptoStub.mockRestore();
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
				signatory: "033007be09f5bf01d8a441e6b97f5607899b65a24aa70b7d144d53986a3f50eb91",
				signature:
					"1cf3d536c4ab197966e12b7a01717c9ede6f3485afdad96f0726df1f31608e067dacf59471ccbccda8be2ab9a2f15585d5e38016362df3aca81f718c5f1605cd1b",
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
