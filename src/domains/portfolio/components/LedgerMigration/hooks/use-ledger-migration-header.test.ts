import { renderHook } from "@testing-library/react";
import { expect, it, describe, beforeEach } from "vitest";
import { useLedgerMigrationHeader } from "./use-ledger-migration-header";
import { MigrateLedgerStep } from "@/domains/portfolio/components/LedgerMigration/LedgerMigration.contracts";
import { WithProviders } from "@/utils/testing-library";
import { useTranslation } from "react-i18next";

describe("useLedgerMigrationHeader", () => {
	let t: ReturnType<typeof useTranslation>["t"];

	beforeEach(() => {
		const { result } = renderHook(() => useTranslation(), { wrapper: WithProviders });
		t = result.current.t;
	});

	describe("SuccessStep", () => {
		it("should return multiple transaction subtitle when hasMultipleTransactions is true", () => {
			const {
				result: { current },
			} = renderHook(() =>
				useLedgerMigrationHeader({ activeTab: MigrateLedgerStep.SuccessStep, hasMultipleTransactions: true }),
			);

			expect(current.subtitle).toBe(t("COMMON.LEDGER_MIGRATION.SUCCESS_DESCRIPTION_MULTIPLE"));
			expect(current.title).toBe(t("COMMON.LEDGER_MIGRATION.MIGRATION_COMPLETED"));
			expect(current.titleIcon).toBeDefined();
		});

		it("should return single transaction subtitle when hasMultipleTransactions is false", () => {
			const {
				result: { current },
			} = renderHook(() =>
				useLedgerMigrationHeader({ activeTab: MigrateLedgerStep.SuccessStep, hasMultipleTransactions: false }),
			);

			expect(current.subtitle).toBe(t("COMMON.LEDGER_MIGRATION.SUCCESS_DESCRIPTION"));
			expect(current.title).toBe(t("COMMON.LEDGER_MIGRATION.MIGRATION_COMPLETED"));
			expect(current.titleIcon).toBeDefined();
		});
	});

	describe("PendingConfirmationStep", () => {
		it("should return verify details subtitle when hasMultipleTransactions is true", () => {
			const {
				result: { current },
			} = renderHook(() =>
				useLedgerMigrationHeader({
					activeTab: MigrateLedgerStep.PendingConfirmationStep,
					hasMultipleTransactions: true,
				}),
			);

			expect(current.subtitle).toBe(t("COMMON.LEDGER_MIGRATION.VERIFY_DETAILS_ON_LEDGER"));
			expect(current.title).toBe(t("TRANSACTION.PENDING.TITLE"));
			expect(current.titleIcon).toBeDefined();
		});

		it("should return undefined subtitle when hasMultipleTransactions is false", () => {
			const {
				result: { current },
			} = renderHook(() =>
				useLedgerMigrationHeader({
					activeTab: MigrateLedgerStep.PendingConfirmationStep,
					hasMultipleTransactions: false,
				}),
			);

			expect(current.subtitle).toBeUndefined();
			expect(current.title).toBe(t("TRANSACTION.PENDING.TITLE"));
			expect(current.titleIcon).toBeDefined();
		});
	});
});
