import { Contracts } from "@ardenthq/sdk-profiles";
import { act, renderHook } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { DateTime } from "@/app/lib/intl";
import { useTransactionExport } from "./use-transaction-export";
import { ExportProgressStatus } from "@/domains/transaction/components/TransactionExportModal";
import { env, getDefaultProfileId, syncDelegates, waitFor } from "@/utils/testing-library";
import { server } from "@/tests/mocks/server";
import transactionsFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions.json";

describe("useTransactionExport hook", () => {
	let profile: Contracts.IProfile;
	const renderExportHook = () =>
		renderHook(() =>
			useTransactionExport({
				profile,
				wallets: [profile.wallets().first()],
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
		await waitFor(() => expect(result.current.count).toBe(10));
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
		await waitFor(() => expect(result.current.count).toBe(10));
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
		await waitFor(() => expect(result.current.count).toBe(10));
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
		await waitFor(() => expect(result.current.count).toBe(10));
	});

	it("should start export and fail", async () => {
		const transactionIndexMock = vi.spyOn(profile.transactionAggregate(), "sent").mockImplementation(() => {
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

		const handler = http.get(`https://dwallets-evm.mainsailhq.com/api/transactions`, ({ request }) => {
			const url = new URL(request.url);
			const to = url.searchParams.get("timestamp.to");

			// return OK response for the first request
			if (to === "0") {
				return HttpResponse.json({
					data: Array.from({ length: 100 }).fill(transactionsFixture.data[0]),
					meta: {
						...transactionsFixture.meta,
						count: 15,
						next: "/transactions?limit=30&orderBy=timestamp%3Adesc&address=0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6&fullReceipt=false&transform=true&page=2",
						pageCount: 2,
						totalCount: 63,
						totalCountIsEstimate: true,
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

		await waitFor(() => expect(result.current.status).toBe(ExportProgressStatus.Success));
		await waitFor(() => expect(result.current.file.content.length).toBeGreaterThan(1));
		await waitFor(() => expect(result.current.count).toBe(100));

		server.resetHandlers();
	});
});
