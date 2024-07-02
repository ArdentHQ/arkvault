import userEvent from "@testing-library/user-event";
import * as browserAccess from "browser-fs-access";
import QRScanner from "qr-scanner";
import React from "react";

import { render, screen, waitFor } from "@/utils/testing-library";

import { QRFileUpload } from "./QRFileUpload";

const qrCodeUrl =
	"http://localhost:3000/#/?amount=10&coin=ARK&method=transfer&network=ark.devnet&recipient=DNSBvFTJtQpS4hJfLerEjSXDrBT7K6HL2o";

describe("QRFileUpload", () => {
	it("should render", () => {
		const { asFragment } = render(<QRFileUpload />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should read qr code", async () => {
		const onRead = vi.fn();
		const browserAccessMock = vi.spyOn(browserAccess, "fileOpen").mockResolvedValue(new File([], "test.png"));

		const scanImageMock = vi.spyOn(QRScanner, "scanImage").mockResolvedValue({ data: qrCodeUrl });

		render(<QRFileUpload onError={vi.fn()} onRead={onRead} />);

		await userEvent.click(screen.getByTestId("QRFileUpload__upload"));
		await waitFor(() => expect(onRead).toHaveBeenCalledWith(qrCodeUrl));

		browserAccessMock.mockRestore();
		scanImageMock.mockRestore();
	});

	it("should stay idle if qr code file is not selected from file dialog", async () => {
		const onRead = vi.fn();
		const browserAccessMock = vi.spyOn(browserAccess, "fileOpen").mockResolvedValue(undefined);

		const scanImageMock = vi.spyOn(QRScanner, "scanImage").mockResolvedValue({ data: qrCodeUrl });

		render(<QRFileUpload onError={vi.fn()} onRead={onRead} />);

		await userEvent.click(screen.getByTestId("QRFileUpload__upload"));
		await waitFor(() => expect(onRead).not.toHaveBeenCalled());

		browserAccessMock.mockRestore();
		scanImageMock.mockRestore();
	});

	it("should stay idle if use closed file dialog", async () => {
		const onRead = vi.fn();
		const onError = vi.fn();
		const browserAccessMock = vi.spyOn(browserAccess, "fileOpen").mockImplementation(() => {
			const error = new Error("AbortError");
			error.name = "AbortError";

			throw error;
		});

		const scanImageMock = vi.spyOn(QRScanner, "scanImage").mockResolvedValue({ data: qrCodeUrl });
		render(<QRFileUpload onRead={onRead} onError={onError} />);

		await userEvent.click(screen.getByTestId("QRFileUpload__upload"));

		await waitFor(() => expect(onRead).not.toHaveBeenCalled());
		await waitFor(() => expect(onError).not.toHaveBeenCalled());

		browserAccessMock.mockRestore();
		scanImageMock.mockRestore();
	});

	it("should emit error if qr code read fails", async () => {
		const onError = vi.fn();
		const browserAccessMock = vi.spyOn(browserAccess, "fileOpen").mockResolvedValue(new File([], "test.png"));
		const errorMessage = "InvalidQR";

		const scanImageMock = vi.spyOn(QRScanner, "scanImage").mockImplementation(() => {
			throw new Error(errorMessage);
		});

		render(<QRFileUpload onError={onError} onRead={vi.fn()} />);

		await userEvent.click(screen.getByTestId("QRFileUpload__upload"));
		await waitFor(() => expect(onError).toHaveBeenCalledWith(new Error(errorMessage)));

		browserAccessMock.mockRestore();
		scanImageMock.mockRestore();
	});
});
