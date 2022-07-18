import React from "react";
import * as browserAccess from "browser-fs-access";
import userEvent from "@testing-library/user-event";

import QRScanner from "qr-scanner";
import { QRFileUpload } from "./QRFileUpload";
import { render, screen, waitFor } from "@/utils/testing-library";

const qrCodeUrl =
	"http://localhost:3000/#/?amount=10&coin=ARK&method=transfer&network=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867.custom&recipient=DNSBvFTJtQpS4hJfLerEjSXDrBT7K6HL2o";

describe("QRFileUpload", () => {
	it("should render", () => {
		const { asFragment } = render(<QRFileUpload />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should read qr code", async () => {
		const onRead = jest.fn();
		const browserAccessMock = jest.spyOn(browserAccess, "fileOpen").mockResolvedValue(new File([], "test.png"));

		const scanImageMock = jest.spyOn(QRScanner, "scanImage").mockResolvedValue({ data: qrCodeUrl });

		render(<QRFileUpload onRead={onRead} />);

		userEvent.click(screen.getByTestId("QRFileUpload__upload"));
		await waitFor(() => expect(onRead).toHaveBeenCalledWith(qrCodeUrl));

		browserAccessMock.mockRestore();
		scanImageMock.mockRestore();
	});

	it("should stay idle if qr code file is not selected from file dialog", async () => {
		const onRead = jest.fn();
		const browserAccessMock = jest.spyOn(browserAccess, "fileOpen").mockResolvedValue(undefined);

		const scanImageMock = jest.spyOn(QRScanner, "scanImage").mockResolvedValue({ data: qrCodeUrl });

		render(<QRFileUpload onRead={onRead} />);

		userEvent.click(screen.getByTestId("QRFileUpload__upload"));
		await waitFor(() => expect(onRead).not.toHaveBeenCalled());

		browserAccessMock.mockRestore();
		scanImageMock.mockRestore();
	});

	it("should stay idle if use closed file dialog", async () => {
		const onRead = jest.fn();
		const onError = jest.fn();
		const browserAccessMock = jest.spyOn(browserAccess, "fileOpen").mockImplementation(() => {
			const error = new Error("AbortError");
			error.name = "AbortError";

			throw error;
		});

		const scanImageMock = jest.spyOn(QRScanner, "scanImage").mockResolvedValue({ data: qrCodeUrl });
		render(<QRFileUpload onRead={onRead} onError={onError} />);

		userEvent.click(screen.getByTestId("QRFileUpload__upload"));

		await waitFor(() => expect(onRead).not.toHaveBeenCalled());
		await waitFor(() => expect(onError).not.toHaveBeenCalled());

		browserAccessMock.mockRestore();
		scanImageMock.mockRestore();
	});

	it("should emit error if qr code read fails", async () => {
		const onError = jest.fn();
		const browserAccessMock = jest.spyOn(browserAccess, "fileOpen").mockResolvedValue(new File([], "test.png"));
		const errorMessage = "InvalidQR";

		const scanImageMock = jest.spyOn(QRScanner, "scanImage").mockImplementation(() => {
			throw new Error(errorMessage);
		});

		render(<QRFileUpload onError={onError} />);

		userEvent.click(screen.getByTestId("QRFileUpload__upload"));
		await waitFor(() => expect(onError).toHaveBeenCalledWith(new Error(errorMessage)));

		browserAccessMock.mockRestore();
		scanImageMock.mockRestore();
	});
});
