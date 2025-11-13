import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { translations as messageTranslations } from "../../i18n";
import {
	env,
	getMainsailProfileId,
	render,
	renderResponsiveWithRoute,
	screen,
	waitFor,
	triggerMessageSignOnce,
	getDefaultMainsailWalletMnemonic,
} from "@/utils/testing-library";
import { VerifyMessageSidePanel } from "./VerifyMessageSidePanel";

let wallet: Contracts.IReadWriteWallet;
let profile: Contracts.IProfile;

let dashboardRoute: string;

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

const fillForm = async (
	signature: string = signedMessage.signature,
	message: string = signedMessage.message,
	signatory: string = signedMessage.signatory,
) => {
	const user = userEvent.setup();

	await user.clear(signatoryInput());
	await user.paste(signatory);

	await waitFor(() => {
		expect(signatoryInput()).toHaveValue(signatory);
	});

	await user.clear(messageInput());
	await user.paste(message);

	await waitFor(() => {
		expect(messageInput()).toHaveValue(message);
	});

	await user.clear(signatureInput());
	await user.paste(signature);

	await waitFor(() => {
		expect(signatureInput()).toHaveValue(signature);
	});
}

// Mock implementation of TextEncoder to always return Uint8Array.
vi.stubGlobal(
	"TextEncoder",
	class MockTextEncoder {
		encode(text) {
			return new Uint8Array([...text].map((character) => character.codePointAt(0)));
		}
	},
);

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

const originalHasInstance = Uint8Array[Symbol.hasInstance];

describe("VerifyMessage", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		wallet = profile.wallets().findById("ee02b13f-8dbf-4191-a9dc-08d2ab72ec28");

		dashboardRoute = `/profiles/${profile.id()}/dashboard`;

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
		const { asFragment } = renderResponsiveWithRoute(<VerifyMessageSidePanel open={true} onOpenChange={vi.fn()} />, breakpoint, {
			route: dashboardRoute,
		});

		await waitFor(() => {
			expect(verifyButton()).toBeDisabled();
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should switch between manual and json input", async () => {
		render(<VerifyMessageSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: dashboardRoute,
		});

		await fillForm();

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
		render(<VerifyMessageSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: dashboardRoute,
		});

		await fillForm();

		await userEvent.click(verifyButton());

		await expectHeading(messageTranslations.PAGE_VERIFY_MESSAGE.SUCCESS_STEP.VERIFIED.TITLE);
	});

	it("should verify message using json", async () => {
		render(<VerifyMessageSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: dashboardRoute,
		});

		await fillForm();

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

	it("should render with deeplink values and use them", async () => {
		render(<VerifyMessageSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${profile.id()}/dashboard?message=hello+world&method=verify&signatory=025f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca&signature=0xc607eab8cd4d8458a3c784888b6579da23544473d86a6e51a93f9ac19c28ade92d7585c678106b0b8dbba0136f483a615a17cec28cf0bc11424996ffddc4eeb61b&coin=Mainsail&network=mainsail.mainnet`,
		});

		expect(signatoryInput()).toHaveValue("025f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca");
		expect(messageInput()).toHaveValue("hello world");
		expect(signatureInput()).toHaveValue(
			"0xc607eab8cd4d8458a3c784888b6579da23544473d86a6e51a93f9ac19c28ade92d7585c678106b0b8dbba0136f483a615a17cec28cf0bc11424996ffddc4eeb61b",
		);

		await waitFor(() => {
			expect(verifyButton()).toBeEnabled();
		});

		await userEvent.click(verifyButton());

		await expectHeading(messageTranslations.PAGE_VERIFY_MESSAGE.SUCCESS_STEP.NOT_VERIFIED.TITLE);
	});

	it("should fail to verify with invalid signature", async () => {
		render(<VerifyMessageSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: dashboardRoute,
		});

		await expectHeading(messageTranslations.PAGE_VERIFY_MESSAGE.FORM_STEP.TITLE);

		const signature =
			"0xc407eab8cd4d8458a3c784888b6579da23544473d86a6e51a93f9ac19c28ade92d7585c678106b0b8dbba0136f483a615a17cec28cf0bc11424996ffddc4eeb61b";

		await fillForm(signature);

		await waitFor(() => {
			expect(verifyButton()).toBeEnabled();
		});

		await userEvent.click(verifyButton());

		await expectHeading(messageTranslations.PAGE_VERIFY_MESSAGE.SUCCESS_STEP.NOT_VERIFIED.TITLE);
	});

	it("should fail to verify using invalid data", async () => {
		render(<VerifyMessageSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: dashboardRoute,
		});

		const messageSpy = vi.spyOn(wallet.message(), "verify").mockResolvedValue(false);

		await expectHeading(messageTranslations.PAGE_VERIFY_MESSAGE.FORM_STEP.TITLE);

		const signature =
			"a2bc0c7de7e0615b752697f5789e5ecb1e6ff400fc1a55df4b620bc17721b7ea552898e0df75aa4fa7a4f301119e9a0315f4abc2e71f31b19e1c6e17bda5ab301b";

		await fillForm(signature)

		await waitFor(() => {
			expect(verifyButton()).toBeEnabled();
		});

		await userEvent.click(verifyButton());

		await expectHeading("Verification Error");

		messageSpy.mockRestore();
	});

	it("should render error step if validation throws an error", async () => {
		render(<VerifyMessageSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: dashboardRoute,
		});

		await expectHeading(messageTranslations.PAGE_VERIFY_MESSAGE.FORM_STEP.TITLE);

		const messageSpy = vi.spyOn(wallet.message(), "verify").mockRejectedValue(new Error("error"));

		await fillForm("fake-signature");

		await userEvent.click(verifyButton());

		await expectHeading(messageTranslations.PAGE_VERIFY_MESSAGE.ERROR_STEP.TITLE);

		await userEvent.click(screen.getByTestId("VerifyMessage__back-button"));

		await expectHeading(messageTranslations.PAGE_VERIFY_MESSAGE.FORM_STEP.TITLE);

		messageSpy.mockRestore();
	});
});
