/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook, act } from "@testing-library/react-hooks";
import { useTransactionExport } from "./use-transaction-export";
import { ExportProgressStatus } from "@/domains/transaction/components/TransactionExportModal";
import { env, getDefaultProfileId, syncDelegates, waitFor } from "@/utils/testing-library";

describe("useTransactionExport hook", () => {
	let profile: Contracts.IProfile;

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await syncDelegates(profile);

		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should start export", async () => {
		const { result } = renderHook(() =>
			useTransactionExport({ wallet: profile.wallets().first(), initialStatus: ExportProgressStatus.Idle }),
		);

		act(() => {
			result.current.startExport({
				transactionType: "all",
				includeHeaderRow: true,
				includeTransactionId: true,
				includeDate: true,
				includeSenderRecipient: true,
				includeCryptoAmount: true,
				includeFiatAmount: true,
				delimiter: "comma",
				dateRange: "custom",
			});
		});

		await waitFor(() => expect(result.current.status).toBe(ExportProgressStatus.Progress));
	});

	it("should set idle status on retry", async () => {
		const { result } = renderHook(() =>
			useTransactionExport({ wallet: profile.wallets().first(), initialStatus: ExportProgressStatus.Progress }),
		);

		act(() => {
			result.current.retry();
		});

		await waitFor(() => expect(result.current.status).toBe(ExportProgressStatus.Idle));
	});

	it("should cancel export", async () => {
		const { result } = renderHook(() =>
			useTransactionExport({ wallet: profile.wallets().first(), initialStatus: ExportProgressStatus.Progress }),
		);

		act(() => {
			result.current.cancelExport();
		});

		await waitFor(() => expect(result.current.status).toBe(ExportProgressStatus.Idle));
	});
});
