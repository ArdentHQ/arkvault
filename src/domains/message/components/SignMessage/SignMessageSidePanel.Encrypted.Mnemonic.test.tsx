import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterAll, expect, vi, MockInstance } from "vitest";
import * as ReactRouter from "react-router";
import { translations as messageTranslations } from "@/domains/message/i18n";
import { env, render, screen, waitFor, triggerMessageSignOnce, MAINSAIL_MNEMONICS } from "@/utils/testing-library";
import { SignMessageSidePanel } from "./SignMessageSidePanel";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let useSearchParamsMock: MockInstance;

const mnemonic = MAINSAIL_MNEMONICS[0];

const continueButton = () => screen.getByTestId("SignMessage__continue-button");
const messageInput = () => screen.getByTestId("SignMessage__message-input");

const signMessage = "Hello World";

const expectHeading = async (text: string) => {
	await waitFor(() => {
		expect(screen.findByRole("heading", { name: text })).toBeDefined();
	});
};

describe("SignMessage with encrypted mnemonic", () => {
	let dashboardRoute: string | undefined;
	beforeAll(async () => {
		profile = await env.profiles().create("Example");

		useSearchParamsMock = vi
			.spyOn(ReactRouter, "useSearchParams")
			.mockReturnValue([new URLSearchParams(), vi.fn()]);

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

	it(
		"should sign message with encrypted mnemonic",
		async () => {
			const encryptedWallet = await profile.walletFactory().fromMnemonicWithBIP39({
				mnemonic,
				password: "password",
			});

			vi.spyOn(encryptedWallet.signingKey(), "get").mockReturnValue(mnemonic);

			profile.wallets().push(encryptedWallet);

			await env.profiles().restore(profile);

			render(<SignMessageSidePanel open={true} onOpenChange={vi.fn()} />, {
				route: dashboardRoute,
			});

			await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

			// The profile only have one address so we dont need to select any address

			expect(
				screen.getByText(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_ENCRYPTION_PASSWORD),
			).toBeInTheDocument();

			await userEvent.type(messageInput(), signMessage);

			await userEvent.type(screen.getByTestId("AuthenticationStep__encryption-password"), "password");

			await waitFor(() =>
				expect(screen.getByTestId("AuthenticationStep__encryption-password")).toHaveValue("password"),
			);

			await waitFor(() => expect(continueButton()).toBeEnabled());

			await userEvent.click(continueButton());

			await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.SUCCESS_STEP.TITLE);

			profile.wallets().forget(encryptedWallet.id());
		},
		{ timeout: 8000 },
	);
});
