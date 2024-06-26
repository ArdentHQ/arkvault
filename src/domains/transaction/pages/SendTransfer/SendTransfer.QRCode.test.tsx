import React from "react";
import { Route } from "react-router-dom";
import QRScanner from "qr-scanner";
import * as browserAccess from "browser-fs-access";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import { renderHook } from "@testing-library/react";
import { Trans, useTranslation } from "react-i18next";

import { SendTransfer } from "./SendTransfer";
import {
	env,
	screen,
	waitFor,
	render,
	getDefaultProfileId,
	getDefaultWalletId,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";
import { useSearchParametersValidation } from "@/app/hooks/use-search-parameters-validation";
import { toasts } from "@/app/services";
import { server, requestMock } from "@/tests/mocks/server";

import transactionFixture from "@/tests/fixtures/coins/ark/devnet/transactions/transfer.json";
import transactionsFixture from "@/tests/fixtures/coins/ark/devnet/transactions.json";

vi.mock("react-qr-reader", () => ({
	QrReader: vi.fn().mockImplementation(() => null),
}));

const QRCodeModalButton = "QRCodeModalButton";
const fixtureProfileId = getDefaultProfileId();
const fixtureWalletId = getDefaultWalletId();
const qrCodeUrl =
	"http://localhost:3000/#/?amount=10&coin=ARK&method=transfer&memo=test&network=ark.devnet&recipient=DNSBvFTJtQpS4hJfLerEjSXDrBT7K6HL2o";

const history = createHashHistory();
let qrScannerMock;

describe("SendTransfer QRModal", () => {
	beforeAll(() => {
		qrScannerMock = vi.spyOn(QRScanner, "scanImage").mockResolvedValue({ data: qrCodeUrl });
		vi.spyOn(browserAccess, "fileOpen").mockResolvedValue(new File([], "test.png"));

		const profile = env.profiles().findById("b999d134-7a24-481e-a95d-bc47c543bfc9");

		profile.coins().set("ARK", "ark.devnet");
	});

	beforeEach(() => {
		server.use(
			requestMock(
				"https://ark-test.arkvault.io/api/transactions/8f913b6b719e7767d49861c0aec79ced212767645cb793d75d2f1b89abb49877",
				transactionFixture,
			),
			requestMock("https://ark-test.arkvault.io/api/transactions", transactionsFixture, {
				query: { address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD" },
			}),
			requestMock(
				"https://ark-test.arkvault.io/api/transactions",
				{ data: [], meta: {} },
				{
					query: {
						limit: 20,
						page: 1,
						senderId: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
					},
				},
			),
		);
	});

	afterEach(() => {
		qrScannerMock.mockReset();
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	it("should read QR and apply transaction parameters", async () => {
		const profile = env.profiles().findById(fixtureProfileId);
		const mockProfileWithOnlyPublicNetworksReset = mockProfileWithPublicAndTestNetworks(profile);
		const toastSpy = vi.spyOn(toasts, "success");
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const transferURL = `/profiles/${fixtureProfileId}/wallets/${fixtureWalletId}/send-transfer?recipient=DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9&memo=ARK&coin=ark&network=ark.devnet`;
		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await userEvent.click(screen.getByTestId(QRCodeModalButton));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("QRFileUpload__upload"));

		await waitFor(() => expect(toastSpy).toHaveBeenCalledWith(t("TRANSACTION.QR_CODE_SUCCESS")));
		mockProfileWithOnlyPublicNetworksReset();
	});

	it("should read QR and prevent from applying parameters if not available in qr code", async () => {
		qrScannerMock = vi.spyOn(QRScanner, "scanImage").mockResolvedValue({
			data: "http://localhost:3000/#/?coin=ARK&method=transfer&network=ark.devnet",
		});

		const profile = env.profiles().findById(fixtureProfileId);
		const mockProfileWithOnlyPublicNetworksReset = mockProfileWithPublicAndTestNetworks(profile);
		const toastSpy = vi.spyOn(toasts, "success");
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const transferURL = `/profiles/${fixtureProfileId}/wallets/${fixtureWalletId}/send-transfer?recipient=DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9&memo=ARK&coin=ark&network=ark.devnet`;
		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("");

		await userEvent.click(screen.getByTestId(QRCodeModalButton));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("QRFileUpload__upload"));

		await waitFor(() => expect(toastSpy).toHaveBeenCalledWith(t("TRANSACTION.QR_CODE_SUCCESS")));

		expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("");

		mockProfileWithOnlyPublicNetworksReset();
	});

	it("should read QR and error for invalid url", async () => {
		qrScannerMock = vi.spyOn(QRScanner, "scanImage").mockResolvedValue({ data: "invalid url" });

		const toastSpy = vi.spyOn(toasts, "error");

		const transferURL = `/profiles/${fixtureProfileId}/wallets/${fixtureWalletId}/send-transfer?recipient=DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9&memo=ARK&coin=ark&network=ark.devnet`;
		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await userEvent.click(screen.getByTestId(QRCodeModalButton));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("QRFileUpload__upload"));

		await waitFor(() =>
			expect(toastSpy).toHaveBeenCalledWith(
				<Trans
					i18nKey="TRANSACTION.VALIDATION.COIN_NOT_SUPPORTED"
					parent={expect.anything()}
					values={{ coin: "ARK" }}
				/>,
			),
		);
	});

	it("should read QR and error for invalid format", async () => {
		qrScannerMock = vi
			.spyOn(QRScanner, "scanImage")
			.mockResolvedValue({ data: "http://localhost:3000/#/?coin=ark" });

		const toastSpy = vi.spyOn(toasts, "error");

		const { result } = renderHook(() => useSearchParametersValidation());

		const transferURL = `/profiles/${fixtureProfileId}/wallets/${fixtureWalletId}/send-transfer`;
		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await userEvent.click(screen.getByTestId(QRCodeModalButton));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("QRFileUpload__upload"));

		await waitFor(() =>
			expect(toastSpy).toHaveBeenCalledWith(
				result.current.buildSearchParametersError({ type: "MISSING_NETWORK_OR_NETHASH" }, true),
			),
		);
	});

	it("should open QR Code Modal and cancel", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${fixtureWalletId}/send-transfer?recipient=DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9&memo=ARK&coin=ark&network=ark.devnet`;
		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await userEvent.click(screen.getByTestId(QRCodeModalButton));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("Modal__close-button"));

		await expect(screen.findByTestId("Modal__inner")).rejects.toThrow(/Unable to find/);
	});
});
