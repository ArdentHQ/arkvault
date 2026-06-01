import { describe, it, expect } from "vitest";
import { ImportAddressStep, getActiveStep } from "./ImportAddressSidePanel.blocks";
import { LedgerTabStep } from "./Ledger/LedgerTabs.contracts";
import { HDWalletTabStep } from "./HDWallet/HDWalletsTabs.contracts";

describe("getActiveStep", () => {
	it("should return 1 for MethodStep", () => {
		expect(getActiveStep(ImportAddressStep.MethodStep, false, false)).toBe(1);
	});

	it("should return activeTab - 1 for non-method, non-ledger, non-hdwallet steps", () => {
		expect(getActiveStep(ImportAddressStep.ImportDetailStep, false, false)).toBe(1);
		expect(getActiveStep(ImportAddressStep.EncryptPasswordStep, false, false)).toBe(2);
		expect(getActiveStep(ImportAddressStep.SummaryStep, false, false)).toBe(3);
	});

	it("should return ledgerActiveTab - 2 for Ledger import", () => {
		expect(getActiveStep(ImportAddressStep.ImportDetailStep, true, false, LedgerTabStep.ListenLedgerStep)).toBe(-1);
		expect(getActiveStep(ImportAddressStep.ImportDetailStep, true, false, LedgerTabStep.LedgerConnectionStep)).toBe(
			0,
		);
		expect(getActiveStep(ImportAddressStep.ImportDetailStep, true, false, LedgerTabStep.LedgerScanStep)).toBe(1);
		expect(getActiveStep(ImportAddressStep.ImportDetailStep, true, false, LedgerTabStep.LedgerImportStep)).toBe(2);
	});

	it("should return HDWalletActiveTab for HD Wallet import", () => {
		expect(
			getActiveStep(
				ImportAddressStep.ImportDetailStep,
				false,
				true,
				undefined,
				HDWalletTabStep.SelectAccountStep,
			),
		).toBe(HDWalletTabStep.SelectAccountStep);
		expect(
			getActiveStep(
				ImportAddressStep.ImportDetailStep,
				false,
				true,
				undefined,
				HDWalletTabStep.EnterMnemonicStep,
			),
		).toBe(HDWalletTabStep.EnterMnemonicStep);
	});

	it("should prioritize HD Wallet over Ledger", () => {
		expect(
			getActiveStep(
				ImportAddressStep.ImportDetailStep,
				true,
				true,
				LedgerTabStep.ListenLedgerStep,
				HDWalletTabStep.SelectAccountStep,
			),
		).toBe(HDWalletTabStep.SelectAccountStep);
	});
});
