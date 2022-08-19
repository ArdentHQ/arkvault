/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Route } from "react-router-dom";

import { createHashHistory } from "history";
import { VerifyMessage } from "./VerifyMessage";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
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
} from "@/utils/testing-library";

const history = createHashHistory();

let wallet: Contracts.IReadWriteWallet;
let profile: Contracts.IProfile;

let walletUrl: string;

let signedMessage: any;
let signedMessageText: string;

const expectHeading = async (text: string) => {
	await expect(screen.findByRole("heading", { name: text })).resolves.toBeVisible();
};

const signatoryInput = () => screen.getByTestId("VerifyMessage__manual-signatory");
const messageInput = () => screen.getByTestId("VerifyMessage__manual-message");
const signatureInput = () => screen.getByTestId("VerifyMessage__manual-signature");

const jsonInput = () => screen.getByTestId("VerifyMessage__json-jsonString");

const verifyButton = () => screen.getByTestId("VerifyMessage__verify-button");

describe("VerifyMessage", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().findById("ac38fe6d-4b67-4ef1-85be-17c5f6841129");

		mockProfileWithPublicAndTestNetworks(profile);

		walletUrl = `/profiles/${profile.id()}/wallets/${wallet.id()}/verify-message`;

		signedMessageText = "Hello World";

		const signatory = await wallet.coin().signatory().mnemonic(MNEMONICS[0]);

		signedMessage = await wallet.message().sign({
			message: signedMessageText,
			signatory,
		});
	});

	beforeEach(() => history.push(walletUrl));

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

		userEvent.paste(signatoryInput(), signedMessage.signatory);
		userEvent.paste(messageInput(), signedMessage.message);
		userEvent.paste(signatureInput(), signedMessage.signature);

		await waitFor(() => {
			expect(verifyButton()).toBeEnabled();
		});

		const toggle = screen.getByRole("checkbox");

		expect(screen.getByTestId("VerifyMessage__manual")).toBeInTheDocument();

		userEvent.click(toggle);

		expect(screen.getByTestId("VerifyMessage__json")).toBeInTheDocument();

		expect(jsonInput()).toHaveValue(JSON.stringify(signedMessage));

		userEvent.click(toggle);

		expect(signatoryInput()).toHaveValue(signedMessage.signatory);
		expect(messageInput()).toHaveValue(signedMessage.message);
		expect(signatureInput()).toHaveValue(signedMessage.signature);

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

		userEvent.paste(signatoryInput(), signedMessage.signatory);
		userEvent.paste(messageInput(), signedMessage.message);
		userEvent.paste(signatureInput(), signedMessage.signature);

		await waitFor(() => {
			expect(verifyButton()).toBeEnabled();
		});

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

		const toggle = screen.getByRole("checkbox");

		userEvent.click(toggle);

		const jsonStringInput = screen.getByTestId("VerifyMessage__json-jsonString");

		userEvent.paste(jsonStringInput, JSON.stringify(signedMessage));

		expect(jsonStringInput).toHaveValue(JSON.stringify(signedMessage));

		await waitFor(() => {
			expect(verifyButton()).toBeEnabled();
		});

		userEvent.click(verifyButton());

		await expectHeading(messageTranslations.PAGE_VERIFY_MESSAGE.SUCCESS_STEP.VERIFIED.TITLE);
	});

	it("should render with deeplink values and use them", async () => {
		const url = `/profiles/${profile.id()}/verify-message?message=hello+world&method=verify&signatory=025f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca&signature=22f8ef55e8120fbf51e2407c808a1cc98d7ef961646226a3d3fad606437f8ba49ab68dc33c6d4a478f954c72e9bac2b4a4fe48baa70121a311a875dba1527d9d&coin=ARK&network=ark.mainnet`

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
		expect(signatureInput()).toHaveValue("22f8ef55e8120fbf51e2407c808a1cc98d7ef961646226a3d3fad606437f8ba49ab68dc33c6d4a478f954c72e9bac2b4a4fe48baa70121a311a875dba1527d9d");

		await waitFor(() => {
			expect(verifyButton()).toBeEnabled();
		});

		userEvent.click(verifyButton());

		await expectHeading(messageTranslations.PAGE_VERIFY_MESSAGE.SUCCESS_STEP.VERIFIED.TITLE);
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

		const messageSpy = jest.spyOn(wallet.message(), "verify").mockResolvedValue(false);

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

		const messageSpy = jest.spyOn(wallet.message(), "verify").mockRejectedValue(new Error("error"));

		userEvent.paste(signatoryInput(), signedMessage.signatory);
		userEvent.paste(messageInput(), signedMessage.message);
		userEvent.paste(signatureInput(), "fake-signature");

		await waitFor(() => {
			expect(verifyButton()).toBeEnabled();
		});

		userEvent.click(verifyButton());

		await expectHeading(messageTranslations.PAGE_VERIFY_MESSAGE.ERROR_STEP.TITLE);

		const historySpy = jest.spyOn(history, "push");

		userEvent.click(screen.getByRole("button", { name: commonTranslations.BACK_TO_WALLET }));

		expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

		historySpy.mockRestore();
		messageSpy.mockRestore();
	});
});
