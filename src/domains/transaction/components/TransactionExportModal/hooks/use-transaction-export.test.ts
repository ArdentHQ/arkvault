import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook, act } from "@testing-library/react-hooks";
import { http, HttpResponse } from "msw";
import { DateTime } from "@ardenthq/sdk-intl";
import { useTransactionExport } from "./use-transaction-export";
import { ExportProgressStatus } from "@/domains/transaction/components/TransactionExportModal";
import { env, getDefaultProfileId, syncDelegates, waitFor } from "@/utils/testing-library";
import { server } from "@/tests/mocks/server";
import transactionsFixture from "@/tests/fixtures/coins/ark/devnet/transactions.json";

describe("useTransactionExport hook", () => {
	let profile: Contracts.IProfile;
	const renderExportHook = () =>
		renderHook(() =>
			useTransactionExport({
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

	it("should start export", async () => {
		const { result } = renderExportHook();

		await act(async () => {
			await result.current.startExport({
				dateRange: "custom",
				delimiter: "comma",
				from: DateTime.make().toDate(),
				includeCryptoAmount: true,
				includeDate: true,
				includeFiatAmount: true,
				includeHeaderRow: true,
				includeSenderRecipient: true,
				includeTransactionId: true,
				to: DateTime.make().addDay(1).toDate(),
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
		const transactionIndexMock = vi.spyOn(profile.wallets().first(), "transactionIndex").mockImplementation(() => {
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

	it("should set idle status on resetStatus", async () => {
		const { result } = renderExportHook();

		act(() => {
			result.current.resetStatus();
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

	it("should properly handle errors", async () => {
		const { result } = renderExportHook();

		const handler = http.get(`https://ark-test.arkvault.io/api/transactions`, ({ request }) => {
			const url = new URL(request.url);
			const to = url.searchParams.get("timestamp.to");

			// return OK response for the first request
			if (to === "0") {
				return HttpResponse.json({
					data: Array.from({ length: 100 }).fill(transactionsFixture.data[0]),
					meta: {
						...transactionsFixture.meta,
					},
				});
			}

			return HttpResponse.json([]);
		});

		server.use(handler);

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

		await waitFor(() => expect(result.current.status).toBe(ExportProgressStatus.Error));
		await waitFor(() => expect(result.current.file.content.length).toBeGreaterThan(1));
		await waitFor(() => expect(result.current.count).toBe(100));

		server.resetHandlers();
	});
});
