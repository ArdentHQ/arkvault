/* eslint-disable @typescript-eslint/require-await */
import { Networks } from "@ardenthq/sdk";
import userEvent from "@testing-library/user-event";
import React from "react";
import { ReceiveFunds } from "./ReceiveFunds";
import { toasts } from "@/app/services";

import { env, getDefaultProfileId, getDefaultWalletId, render, screen, waitFor } from "@/utils/testing-library";

let network: Networks.Network;
const downloadQrButton = "ReceiveFunds__download-qr";

describe("ReceiveFunds", () => {
	beforeEach(() => {
		const profile = env.profiles().findById(getDefaultProfileId());
		const wallet = profile.wallets().findById(getDefaultWalletId());
		network = wallet.network();
	});

	it("should render without a wallet name", async () => {
		const { asFragment } = render(<ReceiveFunds address="abc" network={network} />);

		await waitFor(() => expect(screen.queryAllByTestId("Address__alias")).toHaveLength(0));
		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__Name_Address")).toHaveLength(1));
		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__qrcode")).toHaveLength(1));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with a wallet name", async () => {
		const { asFragment } = render(<ReceiveFunds address="abc" name="My Wallet" network={network} />);

		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__Name_Address")).toHaveLength(1));
		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__qrcode")).toHaveLength(1));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should handle close", async () => {
		const onClose = vi.fn();

		render(<ReceiveFunds address="abc" name="My Wallet" network={network} onClose={onClose} />);

		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__Name_Address")).toHaveLength(1));
		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__qrcode")).toHaveLength(1));

		userEvent.click(screen.getByTestId("Modal__close-button"));

		expect(onClose).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should open qr code form", async () => {
		render(<ReceiveFunds address="abc" name="My Wallet" network={network} />);

		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__Name_Address")).toHaveLength(1));
		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__qrcode")).toHaveLength(1));

		userEvent.click(screen.getByTestId("ReceiveFunds__toggle"));

		await waitFor(() => expect(screen.getByTestId("ReceiveFundsForm__amount")).not.toHaveValue());
		await waitFor(() => expect(screen.getByTestId("ReceiveFundsForm__memo")).not.toHaveValue());
	});

	it("should do nothing after qr download if user closes file dialog", async () => {
		const successToastSpy = vi.spyOn(toasts, "success").mockImplementation(vi.fn());
		render(<ReceiveFunds address="abc" name="My Wallet" network={network} />);

		await waitFor(() => expect(screen.queryAllByTestId(downloadQrButton)).toHaveLength(1));

		userEvent.click(screen.getByTestId("ReceiveFunds__download-qr"));
		await waitFor(() => expect(successToastSpy).not.toHaveBeenCalledWith(expect.anything()));
	});

	it("should not call success toast after qr download for legacy browsers", async () => {
		const successToastSpy = vi.spyOn(toasts, "success").mockImplementation(vi.fn());
		vi.spyOn(global, "fetch").mockImplementation(() =>
			Promise.resolve({
				blob: () => Promise.resolve(new Blob()),
				json: () => Promise.resolve({ test: "Test" }),
				text: () => Promise.resolve("text"),
			}),
		);
		render(<ReceiveFunds address="abc" name="My Wallet" network={network} />);

		await waitFor(() => expect(screen.queryAllByTestId(downloadQrButton)).toHaveLength(1));

		userEvent.click(screen.getByTestId("ReceiveFunds__download-qr"));
		await waitFor(() => expect(successToastSpy).not.toHaveBeenCalledWith(expect.anything()));
	});

	it("should handle qr image download", async () => {
		const successToastSpy = vi.spyOn(toasts, "success").mockImplementation(vi.fn());
		Object.defineProperty(window, "showSaveFilePicker", vi.fn());
		render(<ReceiveFunds address="abc" name="My Wallet" network={network} />);

		await waitFor(() => expect(screen.queryAllByTestId(downloadQrButton)).toHaveLength(1));

		userEvent.click(screen.getByTestId("ReceiveFunds__download-qr"));
		await waitFor(() => expect(successToastSpy).toHaveBeenCalledWith(expect.anything()));
	});
});
