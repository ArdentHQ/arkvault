/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Route } from "react-router-dom";

import { createHashHistory } from "history";
import { VerifyMessage } from "./VerifyMessage";
import { translations as messageTranslations } from "@/domains/message/i18n";
import {
	env,
	getDefaultProfileId,
	MNEMONICS,
	mockProfileWithPublicAndTestNetworks,
	render,
	renderResponsiveWithRoute,
	screen,
	waitFor,
	triggerMessageSignOnce,
} from "@/utils/testing-library";

const history = createHashHistory();

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

describe("VerifyMessage", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().findById("ac38fe6d-4b67-4ef1-85be-17c5f6841129");

		mockProfileWithPublicAndTestNetworks(profile);

		walletUrl = `/profiles/${profile.id()}/wallets/${wallet.id()}/verify-message`;

		signedMessageText = "Hello World";

		const signatory = await wallet.coin().signatory().mnemonic(MNEMONICS[0]);

		await triggerMessageSignOnce(wallet);

		signedMessage = await wallet.message().sign({
			message: signedMessageText,
			signatory,
		});
	});

	beforeEach(() => {
		history.push(walletUrl);
	});

	it.each(["xs", "lg"])("should render (%s)", async (breakpoint) => {
		const { asFragment } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/wallets/:walletId/verify-message">
				<VerifyMessage />
			</Route>,
			breakpoint,
			{
				history,
				route: walletUrl,
			},
		);

		await waitFor(() => {
			expect(verifyButton()).toBeDisabled();
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should switch between manual and json input", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/:walletId/verify-message">
				<VerifyMessage />
			</Route>,
			{
				history,
				route: walletUrl,
			},
		);

		userEvent.type(signatoryInput(), signedMessage.signatory);
		userEvent.type(messageInput(), signedMessage.message);
		userEvent.type(signatureInput(), signedMessage.signature);

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

		const toggle = screen.getByRole("checkbox");

		expect(screen.getByTestId("VerifyMessage__manual")).toBeInTheDocument();

		userEvent.click(toggle);

		await waitFor(() => {
			expect(screen.getByTestId("VerifyMessage__json")).toBeInTheDocument();
		});

		await waitFor(
			() => {
				expect(jsonInput()).toHaveValue(JSON.stringify(signedMessage));
			},
			{ timeout: 4000 },
		);

		userEvent.click(toggle);

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
		render(
			<Route path="/profiles/:profileId/wallets/:walletId/verify-message">
				<VerifyMessage />
			</Route>,
			{
				history,
				route: walletUrl,
			},
		);

		userEvent.type(signatoryInput(), signedMessage.signatory);
		userEvent.type(messageInput(), signedMessage.message);
		userEvent.type(signatureInput(), signedMessage.signature);

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

		userEvent.click(screen.getByRole("checkbox"));

		userEvent.click(verifyButton());

		await expectHeading(messageTranslations.PAGE_VERIFY_MESSAGE.SUCCESS_STEP.VERIFIED.TITLE);
	});

	it("should verify message using json", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/:walletId/verify-message">
				<VerifyMessage />
			</Route>,
			{
				history,
				route: walletUrl,
			},
		);

		userEvent.type(signatoryInput(), signedMessage.signatory);
		userEvent.type(messageInput(), signedMessage.message);
		userEvent.type(signatureInput(), signedMessage.signature);

		userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => {
			expect(screen.getByTestId("VerifyMessage__json-jsonString")).toHaveValue(JSON.stringify(signedMessage));
		});

		await waitFor(() => {
			expect(verifyButton()).toBeEnabled();
		});

		userEvent.click(verifyButton());

		await expectHeading(messageTranslations.PAGE_VERIFY_MESSAGE.SUCCESS_STEP.VERIFIED.TITLE);
	});

	it("should not paste json values if all fields are empty", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/:walletId/verify-message">
				<VerifyMessage />
			</Route>,
			{
				history,
				route: walletUrl,
			},
		);

		userEvent.paste(messageInput(), "");
		userEvent.paste(signatoryInput(), "");
		userEvent.paste(signatureInput(), signedMessage.signature);

		userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => {
			expect(screen.getByTestId("VerifyMessage__json-jsonString")).not.toHaveValue(JSON.stringify(signedMessage));
		});

		await waitFor(() => {
			expect(verifyButton()).not.toBeEnabled();
		});
	});

	it("should render with deeplink values and use them", async () => {
		const url = `/profiles/${profile.id()}/verify-message?message=hello+world&method=verify&signatory=025f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca&signature=22f8ef55e8120fbf51e2407c808a1cc98d7ef961646226a3d3fad606437f8ba49ab68dc33c6d4a478f954c72e9bac2b4a4fe48baa70121a311a875dba1527d9d&coin=ARK&network=ark.mainnet`;

		history.push(url);

		render(
			<Route path="/profiles/:profileId/verify-message">
				<VerifyMessage />
			</Route>,
			{
				history,
				route: url,
			},
		);

		expect(signatoryInput()).toHaveValue("025f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca");
		expect(messageInput()).toHaveValue("hello world");
		expect(signatureInput()).toHaveValue(
			"22f8ef55e8120fbf51e2407c808a1cc98d7ef961646226a3d3fad606437f8ba49ab68dc33c6d4a478f954c72e9bac2b4a4fe48baa70121a311a875dba1527d9d",
		);

		await waitFor(() => {
			expect(verifyButton()).toBeEnabled();
		});

		userEvent.click(verifyButton());

		await expectHeading(messageTranslations.PAGE_VERIFY_MESSAGE.SUCCESS_STEP.VERIFIED.TITLE);
	});

	it("should return to dashboard when accessed through deeplink", async () => {
		const url = `/profiles/${profile.id()}/verify-message?message=hello+world&method=verify&signatory=025f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca&signature=22f8ef55e8120fbf51e2407c808a1cc98d7ef961646226a3d3fad606437f8ba49ab68dc33c6d4a478f954c72e9bac2b4a4fe48baa70121a311a875dba1527d9d&coin=ARK&network=ark.mainnet`;

		history.push(url);

		render(
			<Route path="/profiles/:profileId/verify-message">
				<VerifyMessage />
			</Route>,
			{
				history,
				route: url,
			},
		);

		await expectHeading(messageTranslations.PAGE_VERIFY_MESSAGE.FORM_STEP.TITLE);

		const historySpy = vi.spyOn(history, "push");

		userEvent.click(screen.getByTestId("VerifyMessage__back-button"));

		expect(historySpy).toHaveBeenCalledWith("/");
	});

	it("should fail to verify with invalid signature", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/:walletId/verify-message">
				<VerifyMessage />
			</Route>,
			{
				history,
				route: walletUrl,
			},
		);

		userEvent.paste(signatoryInput(), signedMessage.signatory);
		userEvent.paste(messageInput(), signedMessage.message);
		userEvent.paste(signatureInput(), "fake-signature");

		await waitFor(() => {
			expect(verifyButton()).toBeEnabled();
		});

		userEvent.click(verifyButton());

		await expectHeading(messageTranslations.PAGE_VERIFY_MESSAGE.SUCCESS_STEP.NOT_VERIFIED.TITLE);
	});

	it("should fail to verify using invalid data", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/:walletId/verify-message">
				<VerifyMessage />
			</Route>,
			{
				history,
				route: walletUrl,
			},
		);

		const messageSpy = vi.spyOn(wallet.message(), "verify").mockResolvedValue(false);

		userEvent.paste(signatoryInput(), signedMessage.signatory);
		userEvent.paste(messageInput(), signedMessage.message);
		userEvent.paste(signatureInput(), "fake-signature");

		await waitFor(() => {
			expect(verifyButton()).toBeEnabled();
		});

		userEvent.click(verifyButton());

		await expectHeading(messageTranslations.PAGE_VERIFY_MESSAGE.SUCCESS_STEP.NOT_VERIFIED.TITLE);

		messageSpy.mockRestore();
	});

	it("should render error step if validation throws an error", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/:walletId/verify-message">
				<VerifyMessage />
			</Route>,
			{
				history,
				route: walletUrl,
			},
		);

		const messageSpy = vi.spyOn(wallet.message(), "verify").mockRejectedValue(new Error("error"));

		userEvent.paste(signatoryInput(), signedMessage.signatory);
		userEvent.paste(messageInput(), signedMessage.message);
		userEvent.paste(signatureInput(), "fake-signature");

		await waitFor(() => {
			expect(verifyButton()).toBeEnabled();
		});

		userEvent.click(verifyButton());

		await expectHeading(messageTranslations.PAGE_VERIFY_MESSAGE.ERROR_STEP.TITLE);

		const historySpy = vi.spyOn(history, "push");

		userEvent.click(screen.getByTestId("ErrorStep__close-button"));

		expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

		historySpy.mockRestore();
		messageSpy.mockRestore();
	});
});
