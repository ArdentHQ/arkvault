import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import * as browserAccess from "browser-fs-access";

import QRScanner from "qr-scanner";
import { QrReader } from "react-qr-reader";
import { QRModal } from "./QRModal";
import { toasts } from "@/app/services";
import { render, screen } from "@/utils/testing-library";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";

const qrCodeUrl =
	"http://localhost:3000/#/?amount=10&coin=ARK&method=transfer&network=ark.devnet&recipient=DNSBvFTJtQpS4hJfLerEjSXDrBT7K6HL2o";

vi.mock("react-qr-reader", () => ({
	QrReader: vi.fn().mockImplementation(({ onResult }: { onResult: (result: any) => void }) => {
		if (onResult) {
			onResult({});
		}

		return null;
	}),
}));

describe("QRModal", () => {
	it("should render", () => {
		const { asFragment } = render(<QRModal isOpen={true} onCancel={vi.fn()} onRead={vi.fn()} />);

		expect(screen.getByText(transactionTranslations.MODAL_QR_CODE.TITLE)).toBeInTheDocument();
		expect(screen.getByText(transactionTranslations.MODAL_QR_CODE.DESCRIPTION)).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should execute onCancel callback", async () => {
		const onCancel = vi.fn();

		render(<QRModal isOpen={true} onCancel={onCancel} onRead={vi.fn()} />);

		const closeButton = screen.getByTestId("Modal__close-button");

		await userEvent.click(closeButton);

		expect(onCancel).toHaveBeenCalledWith();
	});

	it("should render invalid qr error from file upload", async () => {
		const toastSpy = vi.spyOn(toasts, "error");

		const browserAccessMock = vi.spyOn(browserAccess, "fileOpen").mockResolvedValue(new File([], "test.png"));
		QrReader.mockImplementation(() => null);
		const scanImageMock = vi.spyOn(QRScanner, "scanImage").mockImplementation(() => {
			throw new Error("InvalidQR");
		});

		render(<QRModal isOpen={true} onCancel={vi.fn()} onRead={vi.fn()} />);
		await userEvent.click(screen.getByTestId("QRFileUpload__upload"));

		await waitFor(() => {
			expect(toastSpy).toHaveBeenCalledWith(transactionTranslations.MODAL_QR_CODE.INVALID_QR_CODE);
		});

		scanImageMock.mockRestore();
		browserAccessMock.mockRestore();

		toastSpy.mockReset();
	});

	it("should handle read", async () => {
		const onRead = vi.fn();
		const browserAccessMock = vi.spyOn(browserAccess, "fileOpen").mockResolvedValue(new File([], "test.png"));
		QrReader.mockImplementation(() => null);
		const scanImageMock = vi.spyOn(QRScanner, "scanImage").mockReturnValue({ data: qrCodeUrl });

		render(<QRModal isOpen={true} onCancel={vi.fn()} onRead={onRead} />);
		await userEvent.click(screen.getByTestId("QRFileUpload__upload"));

		await waitFor(() => expect(onRead).toHaveBeenCalledWith(qrCodeUrl));
		scanImageMock.mockRestore();
		browserAccessMock.mockRestore();
	});

	it("should render permission denied error", () => {
		QrReader.mockImplementation(
			({ onResult }: { onResult: (result: any, error?: Error | null) => void }) => {
				if (onResult) {
					onResult(undefined, new Error("Permission denied"));
				}

				return null;
			},
		);

		render(<QRModal isOpen={true} onCancel={vi.fn()} onRead={vi.fn()} />);

		// eslint-disable-next-line testing-library/no-node-access
		expect(document.querySelector("svg#error-small")).toBeInTheDocument();

		expect(screen.getByText(transactionTranslations.MODAL_QR_CODE.PERMISSION_ERROR.TITLE)).toBeInTheDocument();
		expect(
			screen.getByText(transactionTranslations.MODAL_QR_CODE.PERMISSION_ERROR.DESCRIPTION),
		).toBeInTheDocument();
	});

	it("should render other error", async () => {
		const toastSpy = vi.spyOn(toasts, "error");

		QrReader.mockImplementation(
			({ onResult }: { onResult: (result: any, error?: Error | null) => void }) => {
				if (onResult) {
					onResult(undefined, new Error("other error"));
				}

				return null;
			},
		);

		const { rerender } = render(<QRModal isOpen={true} onCancel={vi.fn()} onRead={vi.fn()} />);

		rerender(<QRModal isOpen={true} onCancel={vi.fn()} onRead={vi.fn()} />);
		rerender(<QRModal isOpen={true} onCancel={vi.fn()} onRead={vi.fn()} />);
		rerender(<QRModal isOpen={true} onCancel={vi.fn()} onRead={vi.fn()} />);
		rerender(<QRModal isOpen={true} onCancel={vi.fn()} onRead={vi.fn()} />);

		await waitFor(() => {
			expect(toastSpy).toHaveBeenCalledWith(transactionTranslations.MODAL_QR_CODE.ERROR);
		});
	});
});
