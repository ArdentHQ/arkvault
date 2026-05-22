import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@/utils/testing-library";

import { useLedgerTabsHandleNext } from "./LedgerTabs.blocks";
import { LedgerTabStep } from "./LedgerTabs.contracts";

describe("useLedgerTabsHandleNext", () => {
	const mockOnStepChange = vi.fn();
	const mockSetShowRetry = vi.fn();
	const mockSetActiveTab = vi.fn();
	const mockHandleWalletImporting = vi.fn().mockResolvedValue(undefined);

	let mockHandleSubmit: ReturnType<typeof vi.fn>;

	const createDeps = (overrides: Partial<Parameters<typeof useLedgerTabsHandleNext>[0]> = {}) => ({
		activeTab: overrides.activeTab ?? LedgerTabStep.ListenLedgerStep,
		showRetry: false,
		onStepChange: mockOnStepChange,
		setShowRetry: mockSetShowRetry,
		setActiveTab: mockSetActiveTab,
		handleSubmit: (mockHandleSubmit as any) ?? vi.fn(),
		handleWalletImporting: mockHandleWalletImporting,
		...overrides,
	});

	beforeEach(() => {
		vi.clearAllMocks();
		mockHandleSubmit = vi.fn((cb) => () => {
			cb({ wallets: [] });
			return undefined;
		});
		mockSetShowRetry.mockReset();
		mockSetActiveTab.mockReset();
		mockOnStepChange.mockReset();
		mockHandleWalletImporting.mockResolvedValue(undefined);
	});

	it("should advance activeTab by 1 when not on LedgerScanStep", async () => {
		const { result } = renderHook(() =>
			useLedgerTabsHandleNext(
				createDeps({
					activeTab: LedgerTabStep.ListenLedgerStep,
					handleSubmit: mockHandleSubmit as any,
				}),
			),
		);

		await act(async () => {
			await result.current.handleNext();
		});

		expect(mockSetActiveTab).toHaveBeenCalledWith(LedgerTabStep.ListenLedgerStep + 1);
		expect(mockOnStepChange).toHaveBeenCalledWith(LedgerTabStep.ListenLedgerStep + 1);
	});

	it("should call handleWalletImporting when on LedgerScanStep", async () => {
		const { result } = renderHook(() =>
			useLedgerTabsHandleNext(
				createDeps({
					activeTab: LedgerTabStep.LedgerScanStep,
					handleSubmit: mockHandleSubmit as any,
				}),
			),
		);

		await act(async () => {
			await result.current.handleNext();
		});

		expect(mockHandleWalletImporting).toHaveBeenCalledWith({ wallets: [] });
	});

	it("should set showRetry to false when showRetry is true", async () => {
		const { result } = renderHook(() =>
			useLedgerTabsHandleNext(
				createDeps({
					activeTab: LedgerTabStep.ListenLedgerStep,
					showRetry: true,
					handleSubmit: mockHandleSubmit as any,
				}),
			),
		);

		await act(async () => {
			await result.current.handleNext();
		});

		expect(mockSetShowRetry).toHaveBeenCalledWith(false);
	});

	it("should not call setShowRetry when showRetry is false", async () => {
		const { result } = renderHook(() =>
			useLedgerTabsHandleNext(
				createDeps({
					activeTab: LedgerTabStep.ListenLedgerStep,
					showRetry: false,
					handleSubmit: mockHandleSubmit as any,
				}),
			),
		);

		await act(async () => {
			await result.current.handleNext();
		});

		expect(mockSetShowRetry).not.toHaveBeenCalled();
	});

	it("should advance LedgerConnectionStep to LedgerScanStep", async () => {
		const { result } = renderHook(() =>
			useLedgerTabsHandleNext(
				createDeps({
					activeTab: LedgerTabStep.LedgerConnectionStep,
					handleSubmit: mockHandleSubmit as any,
				}),
			),
		);

		await act(async () => {
			await result.current.handleNext();
		});

		expect(mockSetActiveTab).toHaveBeenCalledWith(LedgerTabStep.LedgerScanStep);
		expect(mockOnStepChange).toHaveBeenCalledWith(LedgerTabStep.LedgerScanStep);
	});

	it("should advance LedgerScanStep to LedgerImportStep and call import", async () => {
		const { result } = renderHook(() =>
			useLedgerTabsHandleNext(
				createDeps({
					activeTab: LedgerTabStep.LedgerScanStep,
					handleSubmit: mockHandleSubmit as any,
				}),
			),
		);

		await act(async () => {
			await result.current.handleNext();
		});

		expect(mockHandleWalletImporting).toHaveBeenCalledWith({ wallets: [] });
		expect(mockSetActiveTab).toHaveBeenCalledWith(LedgerTabStep.LedgerImportStep);
		expect(mockOnStepChange).toHaveBeenCalledWith(LedgerTabStep.LedgerImportStep);
	});

	it("should advance LedgerImportStep to next step", async () => {
		const { result } = renderHook(() =>
			useLedgerTabsHandleNext(
				createDeps({
					activeTab: LedgerTabStep.LedgerImportStep,
					handleSubmit: mockHandleSubmit as any,
				}),
			),
		);

		await act(async () => {
			await result.current.handleNext();
		});

		expect(mockSetActiveTab).toHaveBeenCalledWith(LedgerTabStep.LedgerImportStep + 1);
		expect(mockOnStepChange).toHaveBeenCalledWith(LedgerTabStep.LedgerImportStep + 1);
	});

	it("should not call handleWalletImporting when showRetry is true and on non-scan step", async () => {
		const { result } = renderHook(() =>
			useLedgerTabsHandleNext(
				createDeps({
					activeTab: LedgerTabStep.ListenLedgerStep,
					showRetry: true,
					handleSubmit: mockHandleSubmit as any,
				}),
			),
		);

		await act(async () => {
			await result.current.handleNext();
		});

		expect(mockSetShowRetry).toHaveBeenCalledWith(false);
		expect(mockHandleWalletImporting).not.toHaveBeenCalled();
		expect(mockSetActiveTab).toHaveBeenCalledWith(LedgerTabStep.ListenLedgerStep + 1);
	});
});
