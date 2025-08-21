import React from "react";
import QRScanner from "qr-scanner";
import * as browserAccess from "browser-fs-access";
import userEvent from "@testing-library/user-event";
import { within, renderHook } from "@testing-library/react";
import { Trans, useTranslation } from "react-i18next";
import { SendTransferSidePanel } from "./SendTransferSidePanel";
import {
	env,
	screen,
	waitFor,
	render,
	getDefaultProfileId,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import { useSearchParametersValidation } from "@/app/hooks/use-search-parameters-validation";
import { toasts } from "@/app/services";

import transactionFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/transfer.json";
import transactionsFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions.json";

vi.mock("react-qr-reader", () => ({
	QrReader: vi.fn().mockImplementation(() => null),
}));

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

const fixtureProfileId = getDefaultProfileId();
const formStepID = "SendTransfer__form-step";
const modalInnerID = "Modal__inner";

let qrScannerMock;

const selectFirstSenderAddress = async () => {
	const container = screen.getByTestId("sender-address");
	await userEvent.click(within(container).getByTestId("SelectDropdown__input"));
	await expect(screen.findByTestId("SelectDropdown__option--0")).resolves.toBeInTheDocument();
	await userEvent.click(screen.getByTestId("SelectDropdown__option--0"));
};

const openScanModal = async () => {
	await userEvent.click(screen.getByText(transactionTranslations.PAGE_TRANSACTION_SEND.FORM_STEP.SCAN_FULL));
	await expect(screen.findByTestId(modalInnerID)).resolves.toBeInTheDocument();
};

describe("SendTransferSidePanel QRModal", () => {
	beforeAll(async () => {
		const profile = env.profiles().findById(fixtureProfileId);
		await env.profiles().restore(profile);
		await profile.sync();

		qrScannerMock = vi.spyOn(QRScanner, "scanImage");
		vi.spyOn(browserAccess, "fileOpen").mockResolvedValue(new File([], "test.png"));
	});

	beforeEach(() => {
		qrScannerMock.mockResolvedValue({
			data: "http://localhost:3000/#/?amount=10&coin=mainsail&method=transfer&memo=test&network=mainsail.devnet&recipient=0x93485b57ff3DeD81430D08579142fAe8234c6A17",
		} as any);

		server.use(
			requestMock(
				"https://dwallets-evm.mainsailhq.com/api/transactions/8f913b6b719e7767d49861c0aec79ced212767645cb793d75d2f1b89abb49877",
				transactionFixture,
			),
			requestMock("https://dwallets-evm.mainsailhq.com/api/transactions", transactionsFixture, {
				query: { address: "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6" },
			}),
			requestMock(
				"https://dwallets-evm.mainsailhq.com/api/transactions",
				{ data: [], meta: {} },
				{
					query: {
						limit: 20,
						page: 1,
						senderId: "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
					},
				},
			),
		);
	});

	afterEach(() => {
		qrScannerMock.mockClear();
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	it("should read QR and apply transaction parameters", async () => {
		const profile = env.profiles().findById(fixtureProfileId);
		const mockProfileReset = mockProfileWithPublicAndTestNetworks(profile);
		const toastSpy = vi.spyOn(toasts, "success");

		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();
		await selectFirstSenderAddress();

		await openScanModal();
		await userEvent.click(screen.getByTestId("QRFileUpload__upload"));

		// Just assert success toast (values application is covered elsewhere)
		const { result } = renderHook(() => useTranslation());
		await waitFor(() => expect(toastSpy).toHaveBeenCalledWith(result.current.t("TRANSACTION.QR_CODE_SUCCESS")));

		mockProfileReset();
	});

	it("should read QR and prevent from applying parameters if not available in qr code", async () => {
		qrScannerMock.mockResolvedValue({
			data: "http://localhost:3000/#/?coin=mainsail&method=transfer&network=mainsail.devnet",
		} as any);

		const profile = env.profiles().findById(fixtureProfileId);
		const mockProfileReset = mockProfileWithPublicAndTestNetworks(profile);
		const toastSpy = vi.spyOn(toasts, "success");

		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();
		await selectFirstSenderAddress();

		expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("");

		await openScanModal();
		await userEvent.click(screen.getByTestId("QRFileUpload__upload"));

		await waitFor(() => expect(toastSpy).toHaveBeenCalled());
		expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("");

		mockProfileReset();
	});

	it("should read QR and error for invalid url", async () => {
		qrScannerMock.mockResolvedValue({ data: "invalid url" } as any);
		const toastSpy = vi.spyOn(toasts, "error");

		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();
		await selectFirstSenderAddress();

		await openScanModal();
		await userEvent.click(screen.getByTestId("QRFileUpload__upload"));

		await waitFor(() =>
			expect(toastSpy).toHaveBeenCalledWith(
				<Trans
					i18nKey="TRANSACTION.VALIDATION.INVALID_ADDRESS_OR_NETWORK_MISMATCH"
					parent={expect.anything()}
				/>,
			),
		);
	});

	it("should read QR and error for invalid format", async () => {
		qrScannerMock.mockResolvedValue({ data: "http://localhost:3000/#/?coin=mainsail" } as any);
		const toastSpy = vi.spyOn(toasts, "error");
		const { result } = renderHook(() => useSearchParametersValidation());

		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();
		await selectFirstSenderAddress();

		await openScanModal();
		await userEvent.click(screen.getByTestId("QRFileUpload__upload"));

		await waitFor(() =>
			expect(toastSpy).toHaveBeenCalledWith(
				result.current.buildSearchParametersError({ type: "MISSING_NETWORK_OR_NETHASH" }, true),
			),
		);
	});

	it("should open and close the QR Code Modal", async () => {
		const profile = env.profiles().findById(fixtureProfileId);
		const mockProfileReset = mockProfileWithPublicAndTestNetworks(profile);

		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();
		await selectFirstSenderAddress();

		await userEvent.click(screen.getByText(transactionTranslations.PAGE_TRANSACTION_SEND.FORM_STEP.SCAN_FULL));
		await expect(screen.findByTestId(modalInnerID)).resolves.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("Modal__close-button"));
		await expect(screen.findByTestId(modalInnerID)).rejects.toThrow(/Unable to find/);

		mockProfileReset();
	});

	it("should show the overwrite modal and fill values when confirmed", async () => {
		const profile = env.profiles().findById(fixtureProfileId);
		const mockProfileReset = mockProfileWithPublicAndTestNetworks(profile);
		const toastSpy = vi.spyOn(toasts, "success");

		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();
		await selectFirstSenderAddress();

		const recipientInput = within(screen.getByTestId("SelectRecipient__wrapper")).getByTestId(
			"SelectDropdown__input",
		);
		await userEvent.clear(recipientInput);
		await userEvent.type(recipientInput, "address 1");

		await openScanModal();
		await userEvent.click(screen.getByTestId("QRFileUpload__upload"));

		await expect(screen.findByTestId("TransferOverwriteModal")).resolves.toBeInTheDocument();

		const recipientContainer = screen.getByTestId("OverwriteModal__Recipient");
		expect(recipientContainer).toBeInTheDocument();
		expect(within(recipientContainer).getByTestId("OverwriteDetail__Current")).toHaveTextContent("address 1");
		expect(within(recipientContainer).getByTestId("OverwriteDetail__New")).toHaveTextContent(
			"0x93485b57ff3DeD81430D08579142fAe8234c6A17",
		);

		const amountContainer = screen.getByTestId("OverwriteModal__Amount");
		expect(amountContainer).toBeInTheDocument();
		expect(within(amountContainer).getByTestId("OverwriteDetail__Current")).toHaveTextContent("N/A");
		expect(within(amountContainer).getByTestId("OverwriteDetail__New")).toHaveTextContent("10");

		await userEvent.click(screen.getByTestId("OverwriteModal__confirm-button"));

		await waitFor(() => expect(toastSpy).toHaveBeenCalled());
		expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("10");
		expect(recipientInput).toHaveValue("0x93485b57ff3DeD81430D08579142fAe8234c6A17");

		await waitFor(() => expect(screen.queryByTestId("TransferOverwriteModal")).not.toBeInTheDocument());
		mockProfileReset();
	});

	it("should clear the prefilled values", async () => {
		const profile = env.profiles().findById(fixtureProfileId);
		const mockProfileReset = mockProfileWithPublicAndTestNetworks(profile);
		const toastSpy = vi.spyOn(toasts, "success");

		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();
		await selectFirstSenderAddress();

		qrScannerMock.mockResolvedValue({
			data: "http://localhost:3000/#/?amount=10&coin=mainsail&method=transfer&memo=test&network=mainsail.devnet",
		} as any);

		const recipientInput = within(screen.getByTestId("SelectRecipient__wrapper")).getByTestId(
			"SelectDropdown__input",
		);
		await userEvent.clear(recipientInput);
		await userEvent.type(recipientInput, "address 1");

		await openScanModal();
		await userEvent.click(screen.getByTestId("QRFileUpload__upload"));

		await expect(screen.findByTestId("TransferOverwriteModal")).resolves.toBeInTheDocument();

		const recipientContainer = screen.getByTestId("OverwriteModal__Recipient");
		expect(recipientContainer).toBeInTheDocument();
		expect(within(recipientContainer).getByTestId("OverwriteDetail__Current")).toHaveTextContent("address 1");
		expect(within(recipientContainer).getByTestId("OverwriteDetail__New")).toHaveTextContent("N/A");

		await userEvent.click(screen.getByTestId("OverwriteModal__confirm-button"));

		await waitFor(() => expect(toastSpy).toHaveBeenCalled());
		expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("10");
		expect(recipientInput).toHaveValue("");

		await waitFor(() => expect(screen.queryByTestId("TransferOverwriteModal")).not.toBeInTheDocument());
		mockProfileReset();
	});

	it("should not show the overwrite modal if the transfer form hasn't filled", async () => {
		const profile = env.profiles().findById(fixtureProfileId);
		const mockProfileReset = mockProfileWithPublicAndTestNetworks(profile);
		const toastSpy = vi.spyOn(toasts, "success");

		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();
		await selectFirstSenderAddress();

		qrScannerMock.mockResolvedValue({
			data: "http://localhost:3000/#/?amount=10&coin=mainsail&method=transfer&memo=test&network=mainsail.devnet",
		} as any);

		await openScanModal();
		await userEvent.click(screen.getByTestId("QRFileUpload__upload"));

		expect(screen.queryByTestId("TransferOverwriteModal")).not.toBeInTheDocument();
		await waitFor(() => expect(toastSpy).toHaveBeenCalled());
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("10"));

		mockProfileReset();
	});

	it("should close the overwrite modal when canceled", async () => {
		const profile = env.profiles().findById(fixtureProfileId);
		const mockProfileReset = mockProfileWithPublicAndTestNetworks(profile);

		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();
		await selectFirstSenderAddress();

		qrScannerMock.mockResolvedValue({
			data: "http://localhost:3000/#/?amount=10&coin=mainsail&method=transfer&memo=test&network=mainsail.devnet",
		} as any);

		const recipientInput = within(screen.getByTestId("SelectRecipient__wrapper")).getByTestId(
			"SelectDropdown__input",
		);
		await userEvent.clear(recipientInput);
		await userEvent.type(recipientInput, "address 1");

		await openScanModal();
		await userEvent.click(screen.getByTestId("QRFileUpload__upload"));

		await expect(screen.findByTestId("TransferOverwriteModal")).resolves.toBeInTheDocument();
		await userEvent.click(screen.getByTestId("OverwriteModal__cancel-button"));

		await waitFor(() => expect(screen.queryByTestId("TransferOverwriteModal")).not.toBeInTheDocument());
		expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("");
		expect(recipientInput).toHaveValue("address 1");

		mockProfileReset();
	});
});
