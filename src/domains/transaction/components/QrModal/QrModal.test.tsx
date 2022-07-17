import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import * as browserAccess from "browser-fs-access";

import { QrModal } from "./QrModal";
import { render, screen } from "@/utils/testing-library";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import QrScanner from "qr-scanner";

const qrCodeUrl =
	"http://localhost:3000/#/?amount=10&coin=ARK&method=transfer&network=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867.custom&recipient=DNSBvFTJtQpS4hJfLerEjSXDrBT7K6HL2o";

jest.mock("react-qr-reader", () => ({
	QrReader: jest.fn().mockImplementation(({ onResult }: { onResult: (result: any) => void }) => {
		if (onResult) {
			onResult({});
		}

		return null;
	}),
}));

const reactQrReaderMock = require("react-qr-reader");

describe("QrModal", () => {
	it("should render", () => {
		const { asFragment } = render(<QrModal isOpen={true} onCancel={jest.fn()} onRead={jest.fn()} />);

		expect(screen.getByText(transactionTranslations.MODAL_QR_CODE.TITLE)).toBeInTheDocument();
		expect(screen.getByText(transactionTranslations.MODAL_QR_CODE.DESCRIPTION)).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should execute onCancel callback", () => {
		const onCancel = jest.fn();

		render(<QrModal isOpen={true} onCancel={onCancel} onRead={jest.fn()} />);

		const closeButton = screen.getByTestId("Modal__close-button");

		userEvent.click(closeButton);

		expect(onCancel).toHaveBeenCalledWith();
	});

	it("should render invalid qr error from file upload", async () => {
		const browserAccessMock = jest.spyOn(browserAccess, "fileOpen").mockResolvedValue(new File([], "test.png"));
		reactQrReaderMock.QrReader.mockImplementation(() => null);
		const scanImageMock = jest.spyOn(QrScanner, "scanImage").mockImplementation(() => {
			throw new Error("InvalidQR");
		});

		render(<QrModal isOpen={true} onCancel={jest.fn()} onRead={jest.fn()} />);
		userEvent.click(screen.getByTestId("QRFileUpload__upload"));

		await waitFor(() =>
			expect(screen.getByText(transactionTranslations.MODAL_QR_CODE.INVALID_QR_CODE)).toBeInTheDocument(),
		);
		scanImageMock.mockRestore();
		browserAccessMock.mockRestore();
	});

	it("should handle read", async () => {
		const onRead = jest.fn();
		const browserAccessMock = jest.spyOn(browserAccess, "fileOpen").mockResolvedValue(new File([], "test.png"));
		reactQrReaderMock.QrReader.mockImplementation(() => null);
		const scanImageMock = jest.spyOn(QrScanner, "scanImage").mockReturnValue({ data: qrCodeUrl });

		render(<QrModal isOpen={true} onCancel={jest.fn()} onRead={onRead} />);
		userEvent.click(screen.getByTestId("QRFileUpload__upload"));

		await waitFor(() => expect(onRead).toHaveBeenCalledWith(qrCodeUrl));
		scanImageMock.mockRestore();
		browserAccessMock.mockRestore();
	});

	it("should render permission denied error", async () => {
		reactQrReaderMock.QrReader.mockImplementation(
			({ onResult }: { onResult: (result: any, error?: Error | null) => void }) => {
				if (onResult) {
					onResult(undefined, new Error("Permission denied"));
				}

				return null;
			},
		);

		render(<QrModal isOpen={true} onCancel={jest.fn()} onRead={jest.fn()} />);

		await waitFor(() => {
			expect(screen.getByText("error-small.svg")).toBeInTheDocument();
		});

		expect(screen.getByText(transactionTranslations.MODAL_QR_CODE.PERMISSION_ERROR.TITLE)).toBeInTheDocument();
		expect(
			screen.getByText(transactionTranslations.MODAL_QR_CODE.PERMISSION_ERROR.DESCRIPTION),
		).toBeInTheDocument();
	});

	it("should render other error", async () => {
		reactQrReaderMock.QrReader.mockImplementation(
			({ onResult }: { onResult: (result: any, error?: Error | null) => void }) => {
				if (onResult) {
					onResult(undefined, new Error("other error"));
				}

				return null;
			},
		);

		render(<QrModal isOpen={true} onCancel={jest.fn()} onRead={jest.fn()} />);

		await waitFor(() => {
			expect(screen.getByText("error-small.svg")).toBeInTheDocument();
		});

		expect(screen.getByText(transactionTranslations.MODAL_QR_CODE.ERROR)).toBeInTheDocument();
	});
});
