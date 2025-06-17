import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { translations as messageTranslations } from "@/domains/message/i18n";
import { env, render, screen, waitFor, triggerMessageSignOnce } from "@/utils/testing-library";
import { SignMessageSidePanel } from "./SignMessageSidePanel";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

const continueButton = () => screen.getByTestId("SignMessage__continue-button");
const messageInput = () => screen.getByTestId("SignMessage__message-input");

const signMessage = "Hello World";

const expectHeading = async (text: string) => {
	await waitFor(() => {
		expect(screen.findByRole("heading", { name: text })).toBeDefined();
	});
};

describe("SignMessage with encrypted secret", () => {
	let dashboardRoute: string | undefined;
	beforeAll(async () => {
		profile = await env.profiles().create("Example");

		await triggerMessageSignOnce(wallet);
	});

	afterAll(() => {
		env.profiles().forget(profile.id());
	});

	beforeEach(() => {
		dashboardRoute = `/profiles/${profile.id()}/dashboard`;
	});

	it(
		"should sign message with encrypted secret",
		async () => {
			const secret = "secret";

			const encryptedWallet = await profile.walletFactory().fromSecret({
				secret,
			});

			vi.spyOn(encryptedWallet.signingKey(), "get").mockReturnValue(secret);

			await encryptedWallet.signingKey().set(secret, "password");

			encryptedWallet
				.data()
				.set(Contracts.WalletData.ImportMethod, Contracts.WalletImportMethod.SECRET_WITH_ENCRYPTION);

			profile.wallets().push(encryptedWallet);

			render(<SignMessageSidePanel open={true} onOpenChange={vi.fn()} onMountChange={vi.fn()} />, {
				route: dashboardRoute,
			});

			await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

			// The profile only have one address so we dont need to select any address

			await userEvent.type(messageInput(), signMessage);

			await userEvent.type(screen.getByTestId("AuthenticationStep__encryption-password"), "password");

			await waitFor(
				() => expect(screen.getByTestId("AuthenticationStep__encryption-password")).toHaveValue("password"),
				{ timeout: 4000 },
			);

			await waitFor(() => expect(continueButton()).toBeEnabled());

			await userEvent.click(continueButton());
			await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.SUCCESS_STEP.TITLE);

			profile.wallets().forget(encryptedWallet.id());
		},
		{ timeout: 8000 },
	);
});
