import React from "react";
import QRScanner from "qr-scanner";
import * as browserAccess from "browser-fs-access";
import userEvent from "@testing-library/user-event";
import { act, within } from "@testing-library/react";
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

import transactionFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/transfer.json";
import transactionsFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions.json";

vi.mock("react-qr-reader", () => ({
	QrReader: vi.fn().mockImplementation(() => null),
}));

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

const fixtureProfileId = getDefaultProfileId();

let qrScannerMock;

const selectFirstSenderAddress = async () => {
	const container = screen.getByTestId("sender-address");
	await userEvent.click(within(container).getByTestId("SelectDropdown__input"));
	await screen.findByTestId("SelectDropdown__option--0");
	await userEvent.click(screen.getByTestId("SelectDropdown__option--0"));
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

	it("should open and close the QR Code Modal", async () => {
		const profile = env.profiles().findById(fixtureProfileId);
		const mockProfileReset = mockProfileWithPublicAndTestNetworks(profile);

		await act(async () => {
			render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} />, {
				route: `/profiles/${fixtureProfileId}/dashboard`,
			});
		});

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();
		await selectFirstSenderAddress();

		await act(async () => {
			await userEvent.click(screen.getByText(transactionTranslations.PAGE_TRANSACTION_SEND.FORM_STEP.SCAN_FULL));
		});

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeInTheDocument();

		await act(async () => {
			await userEvent.click(screen.getByTestId("Modal__close-button"));
		});

		await expect(screen.findByTestId("Modal__inner")).rejects.toThrow(/Unable to find/);

		mockProfileReset();
	});

	it("should show overwrite modal and confirm", async () => {
		const profile = env.profiles().findById(fixtureProfileId);
		const mockProfileReset = mockProfileWithPublicAndTestNetworks(profile);

		await act(async () => {
			render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} />, {
				route: `/profiles/${fixtureProfileId}/dashboard`,
			});
		});

		await expect(screen.findByTestId("SendTransfer__form-step")).resolves.toBeVisible();
		await selectFirstSenderAddress();

		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");

		await act(async () => {
			await userEvent.click(screen.getByText(transactionTranslations.PAGE_TRANSACTION_SEND.FORM_STEP.SCAN_FULL));
		});

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeInTheDocument();

		await act(async () => {
			await userEvent.click(screen.getByTestId("QRFileUpload__upload"));
		});

		await expect(screen.findByTestId("TransferOverwriteModal")).resolves.toBeInTheDocument();

		await act(async () => {
			await userEvent.click(screen.getByTestId("OverwriteModal__confirm-button"));
		});

		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("10"));

		mockProfileReset();
	});
});
