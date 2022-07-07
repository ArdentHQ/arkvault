/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook, act } from "@testing-library/react-hooks";
import nock from "nock";
import { useTransactionExport } from "./use-transaction-export";
import { ExportProgressStatus } from "@/domains/transaction/components/TransactionExportModal";
import { env, getDefaultProfileId, syncDelegates, waitFor } from "@/utils/testing-library";

describe("useTransactionExport hook", () => {
	let profile: Contracts.IProfile;
	const renderExportHook = () =>
		renderHook(() =>
			useTransactionExport({
				initialStatus: ExportProgressStatus.Idle,
				profile,
				wallet: profile.wallets().first(),
			}),
		);

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await syncDelegates(profile);

		await env.profiles().restore(profile);
		await profile.sync();
	});

	beforeEach(() => {
		nock.disableNetConnect();

		nock("https://ark-test.arkvault.io")
			.get("/api/transactions")
			.query(true)
			.reply(200, () => {
				const { meta, data } = require("tests/fixtures/coins/ark/devnet/transactions.json");
				return {
					data,
					meta,
				};
			});
	});

	it("should start export", async () => {
		const { result } = renderExportHook();

		await act(async () => {
			await result.current.startExport({
				dateRange: "custom",
				delimiter: "comma",
				from: Date.now(),
				includeCryptoAmount: true,
				includeDate: true,
				includeFiatAmount: true,
				includeHeaderRow: true,
				includeSenderRecipient: true,
				includeTransactionId: true,
				to: Date.now(),
				transactionType: "all",
			});
		});

		await waitFor(() => expect(result.current.status).toBe(ExportProgressStatus.Success));
		await waitFor(() => expect(result.current.file.content.length).toBeGreaterThan(1));
		await waitFor(() => expect(result.current.count).toBe(15));
	});

	it("should export all transactions", async () => {
		const { result } = renderExportHook();

		await act(async () => {
			await result.current.startExport({
				dateRange: "all",
				delimiter: "comma",
				includeCryptoAmount: true,
				includeDate: true,
				includeFiatAmount: true,
				includeHeaderRow: true,
				includeSenderRecipient: true,
				includeTransactionId: true,
				transactionType: "all",
			});
		});

		await waitFor(() => expect(result.current.status).toBe(ExportProgressStatus.Success));
		await waitFor(() => expect(result.current.file.content.length).toBeGreaterThan(1));
		await waitFor(() => expect(result.current.count).toBe(15));
	});

	it("should export current transactions", async () => {
		const { result } = renderExportHook();

		await act(async () => {
			await result.current.startExport({
				dateRange: "current",
				delimiter: "comma",
				includeCryptoAmount: true,
				includeDate: true,
				includeFiatAmount: true,
				includeHeaderRow: true,
				includeSenderRecipient: true,
				includeTransactionId: true,
				transactionType: "all",
			});
		});

		await waitFor(() => expect(result.current.status).toBe(ExportProgressStatus.Success));
		await waitFor(() => expect(result.current.file.content.length).toBeGreaterThan(1));
		await waitFor(() => expect(result.current.count).toBe(15));
	});

	it("should export last month transactions", async () => {
		const { result } = renderExportHook();

		await act(async () => {
			await result.current.startExport({
				dateRange: "lastMonth",
				delimiter: "comma",
				includeCryptoAmount: true,
				includeDate: true,
				includeFiatAmount: true,
				includeHeaderRow: true,
				includeSenderRecipient: true,
				includeTransactionId: true,
				transactionType: "all",
			});
		});

		await waitFor(() => expect(result.current.status).toBe(ExportProgressStatus.Success));
		await waitFor(() => expect(result.current.file.content.length).toBeGreaterThan(1));
		await waitFor(() => expect(result.current.count).toBe(15));
	});

	it("should start export and fail", async () => {
		const transactionIndexMock = jest
			.spyOn(profile.wallets().first(), "transactionIndex")
			.mockImplementation(() => {
				throw new Error("error");
			});

		const { result } = renderExportHook();

		await act(async () => {
			await result.current.startExport({
				dateRange: "custom",
				delimiter: "comma",
				from: Date.now(),
				includeCryptoAmount: true,
				includeDate: true,
				includeFiatAmount: true,
				includeHeaderRow: true,
				includeSenderRecipient: true,
				includeTransactionId: true,
				to: Date.now(),
				transactionType: "sent",
			});
		});

		await waitFor(() => expect(result.current.status).toBe(ExportProgressStatus.Error));
		transactionIndexMock.mockRestore();
	});

	it("should set idle status on retry", async () => {
		const { result } = renderExportHook();

		act(() => {
			result.current.retry();
		});

		await waitFor(() => expect(result.current.status).toBe(ExportProgressStatus.Idle));
	});

	it("should cancel export", async () => {
		const { result } = renderExportHook();

		act(() => {
			result.current.cancelExport();
		});

		await waitFor(() => expect(result.current.status).toBe(ExportProgressStatus.Idle));
	});
});
