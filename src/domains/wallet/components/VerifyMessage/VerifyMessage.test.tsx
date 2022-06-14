/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { VerifyMessage } from "./VerifyMessage";
import {
	env,
	getDefaultProfileId,
	MNEMONICS,
	render,
	screen,
	waitFor,
	renderResponsive,
} from "@/utils/testing-library";

let wallet: Contracts.IReadWriteWallet;
let profile: Contracts.IProfile;
let signedMessage: any;
let signedMessageText: string;

describe("VerifyMessage", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().findById("ac38fe6d-4b67-4ef1-85be-17c5f6841129");

		signedMessageText = "Hello World";

		const signatory = await wallet.coin().signatory().mnemonic(MNEMONICS[0]);

		signedMessage = await wallet.message().sign({
			message: signedMessageText,
			signatory,
		});
	});

	const renderComponent = async ({
		isOpen = true,
		walletId = wallet.id(),
		profileId = profile.id(),
		...properties
	}: any) => {
		const utils = render(
			<VerifyMessage isOpen={isOpen} walletId={walletId} profileId={profileId} {...properties} />,
		);

		const submitButton = screen.getByTestId("VerifyMessage__submit");

		await waitFor(() => {
			expect(submitButton).toBeDisabled();
		});

		return utils;
	};

	it.each(["xs", "sm", "md", "lg", "xl"])("should not render in xs", async (breakpoint) => {
		const { asFragment } = renderResponsive(
			<VerifyMessage isOpen={true} walletId={wallet.id()} profileId={profile.id()} />,
			breakpoint,
		);
		await waitFor(() => {
			expect(screen.getByTestId("VerifyMessage__submit")).toBeDisabled();
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should switch between manual and json input", async () => {
		await renderComponent({});

		const toggle = screen.getByRole("checkbox");

		expect(screen.getByTestId("VerifyMessage__manual")).toBeInTheDocument();

		userEvent.click(toggle);

		expect(screen.getByTestId("VerifyMessage__json")).toBeInTheDocument();

		userEvent.click(toggle);

		expect(screen.getByTestId("VerifyMessage__manual")).toBeInTheDocument();
	});

	it("should open verify message modal and cancel", async () => {
		const onCancel = jest.fn();

		await renderComponent({ onCancel });

		const cancelButton = screen.getByTestId("VerifyMessage__cancel");

		userEvent.click(cancelButton);

		expect(onCancel).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should open verify message modal and close modal", async () => {
		const onClose = jest.fn();

		await renderComponent({ onClose });

		const closeButton = screen.getByTestId("Modal__close-button");

		userEvent.click(closeButton);

		expect(onClose).toHaveBeenCalledWith();
	});

	it("should verify message", async () => {
		const onSubmit = jest.fn();

		await renderComponent({ onSubmit });

		const signatoryInput = screen.getByTestId("VerifyMessage__manual-signatory");
		const messageInput = screen.getByTestId("VerifyMessage__manual-message");
		const signatureInput = screen.getByTestId("VerifyMessage__manual-signature");

		userEvent.paste(signatoryInput, signedMessage.signatory);
		userEvent.paste(messageInput, signedMessage.message);
		userEvent.paste(signatureInput, signedMessage.signature);

		const submitButton = screen.getByTestId("VerifyMessage__submit");

		await waitFor(() => {
			expect(submitButton).not.toBeDisabled();
		});

		userEvent.click(submitButton);

		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledWith(true);
		});

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent("success-banner-light-green.svg");
		});
	});

	it("should verify message using json", async () => {
		const onSubmit = jest.fn();

		await renderComponent({ onSubmit });

		const toggle = screen.getByRole("checkbox");

		userEvent.click(toggle);

		const jsonStringInput = screen.getByTestId("VerifyMessage__json-jsonString");

		userEvent.paste(jsonStringInput, JSON.stringify(signedMessage));

		expect(jsonStringInput).toHaveValue(JSON.stringify(signedMessage));

		const submitButton = screen.getByTestId("VerifyMessage__submit");

		await waitFor(() => {
			expect(submitButton).not.toBeDisabled();
		});

		userEvent.click(submitButton);

		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledWith(true);
		});

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent("success-banner-light-green.svg");
		});
	});

	it("should fail to verify with invalid signature", async () => {
		const onSubmit = jest.fn();
		const onClose = jest.fn();

		await renderComponent({ onClose, onSubmit });

		const signatoryInput = screen.getByTestId("VerifyMessage__manual-signatory");
		const messageInput = screen.getByTestId("VerifyMessage__manual-message");
		const signatureInput = screen.getByTestId("VerifyMessage__manual-signature");

		userEvent.paste(signatoryInput, signedMessage.signatory);
		userEvent.paste(messageInput, signedMessage.message);
		userEvent.paste(signatureInput, "fake-signature");

		await waitFor(() => {
			expect(screen.getByTestId("VerifyMessage__submit")).not.toBeDisabled();
		});

		userEvent.click(screen.getByTestId("VerifyMessage__submit"));

		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledWith(false);
		});

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent("error-banner-light-green.svg");
		});

		userEvent.click(screen.getByTestId("Modal__close-button"));

		await waitFor(() => {
			expect(onClose).toHaveBeenCalledWith();
		});
	});

	it("should fail to verify using invalid data", async () => {
		const onSubmit = jest.fn();
		const onClose = jest.fn();

		await renderComponent({ onClose, onSubmit });

		const signatoryInput = screen.getByTestId("VerifyMessage__manual-signatory");
		const messageInput = screen.getByTestId("VerifyMessage__manual-message");
		const signatureInput = screen.getByTestId("VerifyMessage__manual-signature");

		const messageSpy = jest.spyOn(wallet.message(), "verify").mockRejectedValue(new Error("message rejected."));

		userEvent.paste(signatoryInput, signedMessage.signatory);
		userEvent.paste(messageInput, signedMessage.message);
		userEvent.paste(signatureInput, "fake-signature");

		const submitButton = screen.getByTestId("VerifyMessage__submit");

		await waitFor(() => {
			expect(submitButton).not.toBeDisabled();
		});

		userEvent.click(submitButton);

		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledWith(false);
		});

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent("error-banner-light-green.svg");
		});

		userEvent.click(screen.getByTestId("Modal__close-button"));

		await waitFor(() => {
			expect(onClose).toHaveBeenCalledWith();
		});

		messageSpy.mockRestore();
	});
});
