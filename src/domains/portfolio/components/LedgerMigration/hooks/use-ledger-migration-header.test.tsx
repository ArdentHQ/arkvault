import { renderHook } from "@testing-library/react";
import { useLedgerMigrationHeader } from "./use-ledger-migration-header";
import { MigrateLedgerStep } from "@/domains/portfolio/components/LedgerMigration";

describe("useLedgerMigrationHeader", () => {
	it("should return success header for single transaction", () => {
		const { result } = renderHook(() =>
			useLedgerMigrationHeader({
				activeTab: MigrateLedgerStep.SuccessStep,
				hasMultipleTransactions: false,
			}),
		);

		expect(result.current.title).toBe("Migration Completed");
	});

	it("should return success header for multiple transactions", () => {
		const { result } = renderHook(() =>
			useLedgerMigrationHeader({
				activeTab: MigrateLedgerStep.SuccessStep,
				hasMultipleTransactions: true,
			}),
		);

		expect(result.current.title).toBe("Migration Completed");
		expect(result.current.subtitle).toBeDefined();
	});

	it("should return pending confirmation header", () => {
		const { result } = renderHook(() =>
			useLedgerMigrationHeader({
				activeTab: MigrateLedgerStep.PendingConfirmationStep,
				hasMultipleTransactions: false,
			}),
		);

		expect(result.current.title).toContain("Pending");
	});

	it("should return pending confirmation header with subtitle for multiple", () => {
		const { result } = renderHook(() =>
			useLedgerMigrationHeader({
				activeTab: MigrateLedgerStep.PendingConfirmationStep,
				hasMultipleTransactions: true,
			}),
		);

		expect(result.current.subtitle).toBeDefined();
	});

	it("should return approve transaction header", () => {
		const { result } = renderHook(() =>
			useLedgerMigrationHeader({
				activeTab: MigrateLedgerStep.ApproveTransactionStep,
				hasMultipleTransactions: false,
			}),
		);

		expect(result.current.title).toContain("Approve");
	});

	it("should return overview header", () => {
		const { result } = renderHook(() =>
			useLedgerMigrationHeader({
				activeTab: MigrateLedgerStep.OverviewStep,
				hasMultipleTransactions: false,
			}),
		);

		expect(result.current.title).toContain("Review");
	});

	it("should return connection step header", () => {
		const { result } = renderHook(() =>
			useLedgerMigrationHeader({
				activeTab: MigrateLedgerStep.ConnectionStep,
				hasMultipleTransactions: false,
			}),
		);

		expect(result.current.title).toContain("Migration");
		expect(result.current.subtitle).toBeUndefined();
	});

	it("should return listen ledger step header", () => {
		const { result } = renderHook(() =>
			useLedgerMigrationHeader({
				activeTab: MigrateLedgerStep.ListenLedgerStep,
				hasMultipleTransactions: false,
			}),
		);

		expect(result.current.title).toContain("Migration");
	});

	it("should return error step header", () => {
		const { result } = renderHook(() =>
			useLedgerMigrationHeader({
				activeTab: MigrateLedgerStep.ErrorStep,
				hasMultipleTransactions: false,
			}),
		);

		expect(result.current.title).toContain("Rejected");
	});

	it("should return default header for unknown step", () => {
		const { result } = renderHook(() =>
			useLedgerMigrationHeader({
				activeTab: 999 as unknown as MigrateLedgerStep,
				hasMultipleTransactions: false,
			}),
		);

		expect(result.current.title).toContain("Migration");
	});
});
