import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { SignMessageSidePanel } from "./SignMessageSidePanel";
import { translations as messageTranslations } from "@/domains/message/i18n";
import { env, render, screen, waitFor, triggerMessageSignOnce, MAINSAIL_MNEMONICS } from "@/utils/testing-library";
import { afterAll, expect, vi } from "vitest";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let wallet2: Contracts.IReadWriteWallet;

const mnemonic = MAINSAIL_MNEMONICS[0];
const secondMnemonic = MAINSAIL_MNEMONICS[1];

const continueButton = () => screen.getByTestId("SignMessage__continue-button");
const messageInput = () => screen.getByTestId("SignMessage__message-input");

const signMessage = "Hello World";

const expectHeading = async (text: string) => {
	await waitFor(() => {
		expect(screen.getByTestId("SidePanel__title")).toHaveTextContent(text);
	});
};

export const selectNthAddress = async (index = 0) => {
	await userEvent.click(screen.getByTestId("SelectDropdown__input"));

	const elementTestId = `SelectDropdown__option--${index}`;

	await waitFor(() => {
		expect(screen.getByTestId(elementTestId)).toBeInTheDocument();
	});

	await userEvent.click(screen.getByTestId(elementTestId));
};

export const selectFirstAddress = async () => {
	await selectNthAddress();
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

describe("SignMessageSidePanel", () => {
	let dashboardRoute: string | undefined;

	beforeAll(async () => {
		profile = await env.profiles().create("Example");

		wallet = await profile.walletFactory().fromMnemonicWithBIP39({
			mnemonic,
		});

		wallet2 = await profile.walletFactory().fromMnemonicWithBIP39({
			mnemonic: secondMnemonic,
		});

		profile.wallets().push(wallet);
		profile.wallets().push(wallet2);

		vi.spyOn(profile, "walletSelectionMode").mockReturnValue("multiple");

		await triggerMessageSignOnce(wallet);
	});

	afterAll(() => {
		env.profiles().forget(profile.id());
	});

	describe("Sign with Wallet", () => {
		beforeEach(() => {
			dashboardRoute = `/profiles/${profile.id()}/dashboard`;
		});

		it("should render", async () => {
			const { asFragment } = render(
				<SignMessageSidePanel open={true} onOpenChange={vi.fn()} onMountChange={vi.fn()} />,
				{
					route: dashboardRoute,
				},
			);

			await waitFor(() => {
				expect(screen.getByTestId("SignMessage")).toBeInTheDocument();
			});

			expect(messageInput()).toBeInTheDocument();

			expect(asFragment()).toMatchSnapshot();
		});

		it("should sign message with mnemonic", async () => {
			const signedMessage = {
				message: signMessage,
				signatory: "0311b11b0dea8851d49af7c673d7032e37ee12307f9bbd379b64bbdac6ca302e84",
				signature:
					"c7d8b526b6c0f3b17b045149424476802ff44d3636446c6394475fd2193f12a06f8b771387ab986c19c39ff42808be6b06cb871c6fbe17b50d1af194576ec9591b",
			};

			render(<SignMessageSidePanel open={true} onOpenChange={vi.fn()} onMountChange={vi.fn()} />, {
				route: dashboardRoute,
			});

			await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

			expect(
				screen.getByText(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_SELECT_WALLET),
			).toBeInTheDocument();

			await selectFirstAddress();

			expect(
				screen.getByText(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_MNEMONIC),
			).toBeInTheDocument();

			const user = userEvent.setup();

			await user.clear(messageInput());
			await user.paste(signMessage);

			await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

			const mnemonicInput = screen.getByTestId("AuthenticationStep__mnemonic");
			await user.clear(mnemonicInput);
			await user.paste("wrong");

			await waitFor(() => expect(continueButton()).toBeDisabled());

			await user.clear(mnemonicInput);
			await user.paste(mnemonic);
			await waitFor(() => expect(continueButton()).toBeEnabled());

			await userEvent.click(continueButton());

			await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.SUCCESS_STEP.TITLE);

			expect(screen.getByTestId("SignMessage__signature-json")).toBeInTheDocument();

			const writeTextMock = vi.fn();
			vi.stubGlobal("navigator", {
				clipboard: { writeText: writeTextMock },
			});

			await waitFor(() => {
				expect(screen.getByTestId("SignMessage__copy-button")).toBeInTheDocument();
			});

			await userEvent.click(screen.getByTestId("SignMessage__copy-button"));

			await waitFor(() => expect(writeTextMock).toHaveBeenCalledWith(JSON.stringify(signedMessage)));
		});

		it("should sign message with secret", async () => {
			const walletWithSecret = await profile.walletFactory().fromSecret({ secret: "secret" });
			profile.wallets().push(walletWithSecret);

			render(<SignMessageSidePanel open={true} onOpenChange={vi.fn()} onMountChange={vi.fn()} />, {
				route: dashboardRoute,
			});
			await selectNthAddress(2);

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

			profile.wallets().forget(walletWithSecret.id());
		});

		it("should error and go back", async () => {
			const walletWithSecret = await profile.walletFactory().fromSecret({ secret: "123" });
			profile.wallets().push(walletWithSecret);

			render(<SignMessageSidePanel open={true} onOpenChange={vi.fn()} onMountChange={vi.fn()} />, {
				route: dashboardRoute,
			});

			await selectNthAddress(2);

			await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

			expect(
				screen.getByText(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_SECRET),
			).toBeInTheDocument();

			await userEvent.type(messageInput(), signMessage);
			await userEvent.type(screen.getByTestId("AuthenticationStep__secret"), "123");

			await waitFor(() => {
				expect(screen.getByTestId("AuthenticationStep__secret")).toHaveValue("123");
			});

			vi.spyOn(walletWithSecret.message(), "sign").mockImplementation(() => {
				throw new Error("failed to sign");
			});

			await waitFor(() => expect(continueButton()).toBeEnabled());
			await userEvent.click(continueButton());

			await expect(screen.findByTestId("ErrorStep__back-button")).resolves.toBeVisible();

			await userEvent.click(screen.getByTestId("ErrorStep__back-button"));
			await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

			profile.wallets().forget(walletWithSecret.id());
		});
	});
});
