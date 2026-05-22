import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@/utils/testing-library";

import { useLedgerTabsGoToPrev } from "./LedgerTabs.blocks";
import { LedgerTabStep } from "./LedgerTabs.contracts";

describe("useLedgerTabsGoToPrevious", () => {
	const mockOnStepChange = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should initialize with the provided activeIndex", () => {
		const { result } = renderHook(() =>
			useLedgerTabsGoToPrev({
				activeIndex: LedgerTabStep.LedgerConnectionStep,
				onStepChange: mockOnStepChange,
			}),
		);

		expect(result.current.activeTab).toBe(LedgerTabStep.LedgerConnectionStep);
	});

	it("should initialize showRetry to false", () => {
		const { result } = renderHook(() =>
			useLedgerTabsGoToPrev({
				activeIndex: LedgerTabStep.ListenLedgerStep,
				onStepChange: mockOnStepChange,
			}),
		);

		expect(result.current.showRetry).toBe(false);
	});

	it("should decrement activeTab and call onStepChange when goToPreviousStep is called", async () => {
		const { result } = renderHook(() =>
			useLedgerTabsGoToPrev({
				activeIndex: LedgerTabStep.LedgerConnectionStep,
				onStepChange: mockOnStepChange,
			}),
		);

		expect(result.current.activeTab).toBe(LedgerTabStep.LedgerConnectionStep);

		act(() => {
			result.current.goToPreviousStep();
		});

		await waitFor(() => {
			expect(mockOnStepChange).toHaveBeenCalledWith(LedgerTabStep.ListenLedgerStep);
		});
	});

	it("should set showRetry to false when goToPreviousStep is called", async () => {
		const { result } = renderHook(() =>
			useLedgerTabsGoToPrev({
				activeIndex: LedgerTabStep.LedgerConnectionStep,
				onStepChange: mockOnStepChange,
			}),
		);

		act(() => {
			result.current.goToPreviousStep();
		});

		await waitFor(() => {
			expect(result.current.showRetry).toBe(false);
		});
	});

	it("should clamp activeTab to ListenLedgerStep minimum", async () => {
		const { result } = renderHook(() =>
			useLedgerTabsGoToPrev({
				activeIndex: LedgerTabStep.ListenLedgerStep,
				onStepChange: mockOnStepChange,
			}),
		);

		expect(result.current.activeTab).toBe(LedgerTabStep.ListenLedgerStep);

		act(() => {
			result.current.goToPreviousStep();
		});

		await waitFor(() => {
			expect(result.current.activeTab).toBe(LedgerTabStep.ListenLedgerStep);
		});
	});

	it("should decrement by 1 from LedgerScanStep correctly", async () => {
		const { result } = renderHook(() =>
			useLedgerTabsGoToPrev({
				activeIndex: LedgerTabStep.LedgerScanStep,
				onStepChange: mockOnStepChange,
			}),
		);

		expect(result.current.activeTab).toBe(LedgerTabStep.LedgerScanStep);

		act(() => {
			result.current.goToPreviousStep();
		});

		await waitFor(() => {
			expect(result.current.activeTab).toBe(LedgerTabStep.LedgerConnectionStep);
		});

		await waitFor(() => {
			expect(mockOnStepChange).toHaveBeenCalledWith(LedgerTabStep.LedgerConnectionStep);
		});
	});

	it("should decrement by 1 from LedgerImportStep", async () => {
		const { result } = renderHook(() =>
			useLedgerTabsGoToPrev({
				activeIndex: LedgerTabStep.LedgerImportStep,
				onStepChange: mockOnStepChange,
			}),
		);

		expect(result.current.activeTab).toBe(LedgerTabStep.LedgerImportStep);

		act(() => {
			result.current.goToPreviousStep();
		});

		await waitFor(() => {
			expect(result.current.activeTab).toBe(LedgerTabStep.LedgerScanStep);
		});

		await waitFor(() => {
			expect(mockOnStepChange).toHaveBeenCalledWith(LedgerTabStep.LedgerScanStep);
		});
	});

	it("should call onStepChange with the clamped value when already at minimum", async () => {
		const { result } = renderHook(() =>
			useLedgerTabsGoToPrev({
				activeIndex: LedgerTabStep.ListenLedgerStep,
				onStepChange: mockOnStepChange,
			}),
		);

		act(() => {
			result.current.goToPreviousStep();
		});

		await waitFor(() => {
			expect(mockOnStepChange).toHaveBeenCalledWith(LedgerTabStep.ListenLedgerStep);
		});
	});
});
