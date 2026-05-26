import { renderHook } from "@testing-library/react";
import { expect, it, describe, beforeEach } from "vitest";
import { useLedgerMigrationHeader } from "./use-ledger-migration-header";
import { MigrateLedgerStep } from "@/domains/portfolio/components/LedgerMigration";
import { WithProviders } from "@/utils/testing-library";
import { useTranslation } from "react-i18next";

describe("useLedgerMigrationHeader", () => {
	let t: ReturnType<typeof useTranslation>["t"];

	beforeEach(() => {
		const { result } = renderHook(() => useTranslation(), { wrapper: WithProviders });
		t = result.current.t;
	});

	it("should return success header for single transaction", () => {
		const { result } = renderHook(
			() =>
				useLedgerMigrationHeader({
					activeTab: MigrateLedgerStep.SuccessStep,
					hasMultipleTransactions: false,
				}),
			{ wrapper: WithProviders },
		);

		expect(result.current.title).toBe(t("COMMON.LEDGER_MIGRATION.MIGRATION_COMPLETED"));
	});

	it("should return success header for multiple transactions", () => {
		const { result } = renderHook(
			() =>
				useLedgerMigrationHeader({
					activeTab: MigrateLedgerStep.SuccessStep,
					hasMultipleTransactions: true,
				}),
			{ wrapper: WithProviders },
		);

		expect(result.current.title).toBe(t("COMMON.LEDGER_MIGRATION.MIGRATION_COMPLETED"));
		expect(result.current.subtitle).toBeDefined();
	});

	it("should return multiple transaction subtitle when hasMultipleTransactions is true (SuccessStep)", () => {
		const { result } = renderHook(
			() =>
				useLedgerMigrationHeader({
					activeTab: MigrateLedgerStep.SuccessStep,
					hasMultipleTransactions: true,
				}),
			{ wrapper: WithProviders },
		);

		expect(result.current.subtitle).toBe(t("COMMON.LEDGER_MIGRATION.SUCCESS_DESCRIPTION_MULTIPLE"));
	});

	it("should return single transaction subtitle when hasMultipleTransactions is false (SuccessStep)", () => {
		const { result } = renderHook(
			() =>
				useLedgerMigrationHeader({
					activeTab: MigrateLedgerStep.SuccessStep,
					hasMultipleTransactions: false,
				}),
			{ wrapper: WithProviders },
		);

		expect(result.current.subtitle).toBe(t("COMMON.LEDGER_MIGRATION.SUCCESS_DESCRIPTION"));
	});

	it("should return pending confirmation header", () => {
		const { result } = renderHook(
			() =>
				useLedgerMigrationHeader({
					activeTab: MigrateLedgerStep.PendingConfirmationStep,
					hasMultipleTransactions: false,
				}),
			{ wrapper: WithProviders },
		);

		expect(result.current.title).toContain("Pending");
	});

	it("should return pending confirmation header with subtitle for multiple", () => {
		const { result } = renderHook(
			() =>
				useLedgerMigrationHeader({
					activeTab: MigrateLedgerStep.PendingConfirmationStep,
					hasMultipleTransactions: true,
				}),
			{ wrapper: WithProviders },
		);

		expect(result.current.subtitle).toBeDefined();
	});

	it("should return verify details subtitle when hasMultipleTransactions is true (PendingConfirmationStep)", () => {
		const { result } = renderHook(
			() =>
				useLedgerMigrationHeader({
					activeTab: MigrateLedgerStep.PendingConfirmationStep,
					hasMultipleTransactions: true,
				}),
			{ wrapper: WithProviders },
		);

		expect(result.current.subtitle).toBe(t("COMMON.LEDGER_MIGRATION.VERIFY_DETAILS_ON_LEDGER"));
	});

	it("should return undefined subtitle when hasMultipleTransactions is false (PendingConfirmationStep)", () => {
		const { result } = renderHook(
			() =>
				useLedgerMigrationHeader({
					activeTab: MigrateLedgerStep.PendingConfirmationStep,
					hasMultipleTransactions: false,
				}),
			{ wrapper: WithProviders },
		);

		expect(result.current.subtitle).toBeUndefined();
	});

	it("should return approve transaction header", () => {
		const { result } = renderHook(
			() =>
				useLedgerMigrationHeader({
					activeTab: MigrateLedgerStep.ApproveTransactionStep,
					hasMultipleTransactions: false,
				}),
			{ wrapper: WithProviders },
		);

		expect(result.current.title).toContain("Approve");
	});

	it("should return overview header", () => {
		const { result } = renderHook(
			() =>
				useLedgerMigrationHeader({
					activeTab: MigrateLedgerStep.OverviewStep,
					hasMultipleTransactions: false,
				}),
			{ wrapper: WithProviders },
		);

		expect(result.current.title).toContain("Review");
	});

	it("should return connection step header", () => {
		const { result } = renderHook(
			() =>
				useLedgerMigrationHeader({
					activeTab: MigrateLedgerStep.ConnectionStep,
					hasMultipleTransactions: false,
				}),
			{ wrapper: WithProviders },
		);

		expect(result.current.title).toContain("Migration");
		expect(result.current.subtitle).toBeUndefined();
	});

	it("should return listen ledger step header", () => {
		const { result } = renderHook(
			() =>
				useLedgerMigrationHeader({
					activeTab: MigrateLedgerStep.ListenLedgerStep,
					hasMultipleTransactions: false,
				}),
			{ wrapper: WithProviders },
		);

		expect(result.current.title).toContain("Migration");
	});

	it("should return error step header", () => {
		const { result } = renderHook(
			() =>
				useLedgerMigrationHeader({
					activeTab: MigrateLedgerStep.ErrorStep,
					hasMultipleTransactions: false,
				}),
			{ wrapper: WithProviders },
		);

		expect(result.current.title).toContain("Rejected");
	});

	it("should return default header for unknown step", () => {
		const { result } = renderHook(
			() =>
				useLedgerMigrationHeader({
					activeTab: 999 as unknown as MigrateLedgerStep,
					hasMultipleTransactions: false,
				}),
			{ wrapper: WithProviders },
		);

		expect(result.current.title).toContain("Migration");
	});
});
