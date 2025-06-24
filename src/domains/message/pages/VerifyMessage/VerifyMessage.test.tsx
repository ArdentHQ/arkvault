import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { VerifyMessage } from "./VerifyMessage";
import { translations as messageTranslations } from "@/domains/message/i18n";
import {
	env,
	getMainsailProfileId,
	mockProfileWithPublicAndTestNetworks,
	render,
	renderResponsiveWithRoute,
	screen,
	waitFor,
	triggerMessageSignOnce,
	getDefaultMainsailWalletMnemonic,
} from "@/utils/testing-library";

let wallet: Contracts.IReadWriteWallet;
let profile: Contracts.IProfile;

let walletUrl: string;

let signedMessage: any;
let signedMessageText: string;

const expectHeading = async (text: string) => {
	await waitFor(() => {
		expect(screen.getByRole("heading", { name: text })).toBeInTheDocument();
	});
};

const signatoryInput = () => screen.getByTestId("VerifyMessage__manual-signatory");
const messageInput = () => screen.getByTestId("VerifyMessage__manual-message");
const signatureInput = () => screen.getByTestId("VerifyMessage__manual-signature");

const jsonInput = () => screen.getByTestId("VerifyMessage__json-jsonString");

const verifyButton = () => screen.getByTestId("VerifyMessage__verify-button");

// Mock implementation of TextEncoder to always return Uint8Array.
vi.stubGlobal(
	"TextEncoder",
	class MockTextEncoder {
		encode(text) {
			return new Uint8Array([...text].map((character) => character.codePointAt(0)));
		}
	},
);

const originalHasInstance = Uint8Array[Symbol.hasInstance];

describe("VerifyMessage", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		wallet = profile.wallets().findById("ee02b13f-8dbf-4191-a9dc-08d2ab72ec28");

		mockProfileWithPublicAndTestNetworks(profile);

		walletUrl = `/profiles/${profile.id()}/wallets/${wallet.id()}/verify-message`;

		signedMessageText = "Hello World";

		const signatory = await wallet.signatory().mnemonic(getDefaultMainsailWalletMnemonic());

		await triggerMessageSignOnce(wallet);

		signedMessage = await wallet.message().sign({
			message: signedMessageText,
			signatory,
		});

		Object.defineProperty(Uint8Array, Symbol.hasInstance, {
			configurable: true,
			value(potentialInstance: unknown) {
				if (this === Uint8Array) {
					return Object.prototype.toString.call(potentialInstance) === "[object Uint8Array]";
				}
				return originalHasInstance.call(this, potentialInstance);
			},
		});
	});

	it.each(["xs", "lg"])("should render (%s)", async (breakpoint) => {
		const { asFragment } = renderResponsiveWithRoute(<VerifyMessage />, breakpoint, {
			route: walletUrl,
		});

		await waitFor(() => {
			expect(verifyButton()).toBeDisabled();
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should switch between manual and json input", async () => {
		render(<VerifyMessage />, {
			route: walletUrl,
		});

		await userEvent.type(signatoryInput(), signedMessage.signatory);

		await waitFor(() => {
			expect(signatoryInput()).toHaveValue(signedMessage.signatory);
		});

		await userEvent.type(messageInput(), signedMessage.message);

		await waitFor(() => {
			expect(messageInput()).toHaveValue(signedMessage.message);
		});

		await userEvent.type(signatureInput(), signedMessage.signature);

		await waitFor(() => {
			expect(verifyButton()).toBeEnabled();
		});

		const toggle = screen.getByRole("checkbox");

		expect(screen.getByTestId("VerifyMessage__manual")).toBeInTheDocument();

		await userEvent.click(toggle);

		await waitFor(() => {
			expect(screen.getByTestId("VerifyMessage__json")).toBeInTheDocument();
		});

		await waitFor(
			() => {
				expect(jsonInput()).toHaveValue(JSON.stringify(signedMessage));
			},
			{ timeout: 4000 },
		);

		await userEvent.click(toggle);

		await waitFor(() => {
			expect(signatoryInput()).toHaveValue(signedMessage.signatory);
		});

		await waitFor(() => {
			expect(messageInput()).toHaveValue(signedMessage.message);
		});

		await waitFor(() => {
			expect(signatureInput()).toHaveValue(signedMessage.signature);
		});

		await waitFor(() => {
			expect(verifyButton()).toBeEnabled();
		});

		expect(screen.getByTestId("VerifyMessage__manual")).toBeInTheDocument();
	});

	it("should verify message", async () => {
		render(<VerifyMessage />, {
			route: walletUrl,
		});

		await userEvent.type(signatoryInput(), signedMessage.signatory);

		await waitFor(() => {
			expect(signatoryInput()).toHaveValue(signedMessage.signatory);
		});

		await userEvent.type(messageInput(), signedMessage.message);

		await waitFor(() => {
			expect(messageInput()).toHaveValue(signedMessage.message);
		});

		await userEvent.type(signatureInput(), signedMessage.signature);

		await waitFor(() => {
			expect(verifyButton()).toBeEnabled();
		});

		await userEvent.click(verifyButton());

		await expectHeading(messageTranslations.PAGE_VERIFY_MESSAGE.SUCCESS_STEP.VERIFIED.TITLE);
	});

	it("should verify message using json", async () => {
		render(<VerifyMessage />, {
			route: walletUrl,
		});

		await userEvent.type(signatoryInput(), signedMessage.signatory);
		await waitFor(() => {
			expect(signatoryInput()).toHaveValue(signedMessage.signatory);
		});

		await userEvent.type(messageInput(), signedMessage.message);

		await waitFor(() => {
			expect(messageInput()).toHaveValue(signedMessage.message);
		});

		await userEvent.type(signatureInput(), signedMessage.signature);

		await waitFor(() => {
			expect(verifyButton()).toBeEnabled();
		});

		await userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => {
			expect(screen.getByTestId("VerifyMessage__json-jsonString")).toHaveValue(JSON.stringify(signedMessage));
		});

		await waitFor(() => {
			expect(verifyButton()).toBeEnabled();
		});

		await userEvent.click(verifyButton());

		await expectHeading(messageTranslations.PAGE_VERIFY_MESSAGE.SUCCESS_STEP.VERIFIED.TITLE);
	});

	it("should not paste json values if all fields are empty", async () => {
		render(<VerifyMessage />, {
			route: walletUrl,
		});

		await userEvent.clear(messageInput());
		await userEvent.clear(signatureInput());
		await userEvent.type(signatureInput(), signedMessage.signature);

		await waitFor(() => {
			expect(verifyButton()).toBeEnabled();
		});

		await userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => {
			expect(screen.getByTestId("VerifyMessage__json-jsonString")).not.toHaveValue(JSON.stringify(signedMessage));
		});

		await waitFor(() => {
			expect(verifyButton()).not.toBeEnabled();
		});
	});

	it("should render with deeplink values and use them", async () => {
		render(<VerifyMessage />, {
			route: `/profiles/${profile.id()}/verify-message?message=hello+world&method=verify&signatory=025f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca&signature=22f8ef55e8120fbf51e2407c808a1cc98d7ef961646226a3d3fad606437f8ba49ab68dc33c6d4a478f954c72e9bac2b4a4fe48baa70121a311a875dba1527d9d&coin=Mainsail&network=mainsail.mainnet`,
		});

		expect(signatoryInput()).toHaveValue("025f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca");
		expect(messageInput()).toHaveValue("hello world");
		expect(signatureInput()).toHaveValue(
			"22f8ef55e8120fbf51e2407c808a1cc98d7ef961646226a3d3fad606437f8ba49ab68dc33c6d4a478f954c72e9bac2b4a4fe48baa70121a311a875dba1527d9d",
		);

		await waitFor(() => {
			expect(verifyButton()).toBeEnabled();
		});

		await userEvent.click(verifyButton());

		await expectHeading(messageTranslations.PAGE_VERIFY_MESSAGE.SUCCESS_STEP.NOT_VERIFIED.TITLE);
	});

	it("should return to dashboard when accessed through deeplink", async () => {
		const { router } = render(<VerifyMessage />, {
			route: `/profiles/${profile.id()}/verify-message?message=hello+world&method=verify&signatory=025f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca&signature=22f8ef55e8120fbf51e2407c808a1cc98d7ef961646226a3d3fad606437f8ba49ab68dc33c6d4a478f954c72e9bac2b4a4fe48baa70121a311a875dba1527d9d&coin=ARK&network=ark.mainnet`,
		});

		await expectHeading(messageTranslations.PAGE_VERIFY_MESSAGE.FORM_STEP.TITLE);

		await userEvent.click(screen.getByTestId("VerifyMessage__back-button"));

		expect(router.state.location.pathname).toBe("/");
	});

	it("should fail to verify with invalid signature", async () => {
		render(<VerifyMessage />, {
			route: walletUrl,
		});

		await expectHeading(messageTranslations.PAGE_VERIFY_MESSAGE.FORM_STEP.TITLE);

		await userEvent.type(signatoryInput(), signedMessage.signatory);

		await waitFor(() => {
			expect(signatoryInput()).toHaveValue(signedMessage.signatory);
		});

		await userEvent.type(messageInput(), signedMessage.message);

		await waitFor(() => {
			expect(messageInput()).toHaveValue(signedMessage.message);
		});

		const signature =
			"a2bc0c7de7e0615b752697f5789e5ecb1e6ff400fc1a55df4b620bc17721b7ea552898e0df75aa4fa7a4f301119e9a0315f4abc2e71f31b19e1c6e17bda5ab301b";

		await userEvent.type(signatureInput(), signature);

		await waitFor(() => {
			expect(signatureInput()).toHaveValue(signature);
		});

		await waitFor(() => {
			expect(verifyButton()).toBeEnabled();
		});

		await userEvent.click(verifyButton());

		await expectHeading(messageTranslations.PAGE_VERIFY_MESSAGE.SUCCESS_STEP.NOT_VERIFIED.TITLE);
	});

	it("should fail to verify using invalid data", async () => {
		render(<VerifyMessage />, {
			route: walletUrl,
		});

		const messageSpy = vi.spyOn(wallet.message(), "verify").mockResolvedValue(false);

		await expectHeading(messageTranslations.PAGE_VERIFY_MESSAGE.FORM_STEP.TITLE);

		await userEvent.type(signatoryInput(), signedMessage.signatory);

		await waitFor(() => {
			expect(signatoryInput()).toHaveValue(signedMessage.signatory);
		});

		await userEvent.type(messageInput(), signedMessage.message);

		await waitFor(() => {
			expect(messageInput()).toHaveValue(signedMessage.message);
		});

		const signature =
			"a2bc0c7de7e0615b752697f5789e5ecb1e6ff400fc1a55df4b620bc17721b7ea552898e0df75aa4fa7a4f301119e9a0315f4abc2e71f31b19e1c6e17bda5ab301b";

		await userEvent.type(signatureInput(), signature);

		await waitFor(() => {
			expect(signatureInput()).toHaveValue(signature);
		});

		await waitFor(() => {
			expect(verifyButton()).toBeEnabled();
		});

		await userEvent.click(verifyButton());

		await expectHeading(messageTranslations.PAGE_VERIFY_MESSAGE.SUCCESS_STEP.NOT_VERIFIED.TITLE);

		messageSpy.mockRestore();
	});

	it("should render error step if validation throws an error", async () => {
		const { router } = render(<VerifyMessage />, {
			route: walletUrl,
		});

		await expectHeading(messageTranslations.PAGE_VERIFY_MESSAGE.FORM_STEP.TITLE);

		const messageSpy = vi.spyOn(wallet.message(), "verify").mockRejectedValue(new Error("error"));

		await userEvent.type(signatoryInput(), signedMessage.signatory);

		await waitFor(() => {
			expect(signatoryInput()).toHaveValue(signedMessage.signatory);
		});

		await userEvent.type(messageInput(), signedMessage.message);

		await waitFor(() => {
			expect(messageInput()).toHaveValue(signedMessage.message);
		});

		await userEvent.clear(signatureInput());
		await userEvent.type(signatureInput(), "fake-signature");

		await waitFor(() => {
			expect(verifyButton()).toBeEnabled();
		});

		await userEvent.click(verifyButton());

		await expectHeading(messageTranslations.PAGE_VERIFY_MESSAGE.ERROR_STEP.TITLE);

		await userEvent.click(screen.getByTestId("ErrorStep__close-button"));

		expect(router.state.location.pathname).toBe(`/profiles/${profile.id()}/dashboard`);

		messageSpy.mockRestore();
	});
});
