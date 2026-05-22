import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@/utils/testing-library";

import { useLedgerTabsHandleBack } from "./LedgerTabs.blocks";
import { LedgerTabStep } from "./LedgerTabs.contracts";

describe("useLedgerTabsHandleBack", () => {
	const mockSetShowRetry = vi.fn();
	const mockSetActiveTab = vi.fn();
	const mockOnStepChange = vi.fn();
	const mockOnBack = vi.fn();
	const mockOnCancel = vi.fn();

	let activeTabIndex: number;

	beforeEach(() => {
		vi.clearAllMocks();
		mockSetShowRetry.mockReset();
		mockSetActiveTab.mockReset();
		mockOnStepChange.mockReset();
		mockOnBack.mockReset();
		mockOnCancel.mockReset();
		activeTabIndex = LedgerTabStep.ListenLedgerStep;
	});

	it("should set showRetry to false", async () => {
		const { result } = renderHook(() =>
			useLedgerTabsHandleBack({
				activeTab: activeTabIndex,
				setShowRetry: mockSetShowRetry,
				setActiveTab: mockSetActiveTab,
				onStepChange: mockOnStepChange,
				onBack: mockOnBack,
				onCancel: mockOnCancel,
			}),
		);

		act(() => {
			result.current.handleBack();
		});

		expect(mockSetShowRetry).toHaveBeenCalledWith(false);
	});

	it("should call onBack when activeTab is not LedgerImportStep and onBack is provided", async () => {
		const { result } = renderHook(() =>
			useLedgerTabsHandleBack({
				activeTab: LedgerTabStep.ListenLedgerStep,
				setShowRetry: mockSetShowRetry,
				setActiveTab: mockSetActiveTab,
				onStepChange: mockOnStepChange,
				onBack: mockOnBack,
				onCancel: mockOnCancel,
			}),
		);

		act(() => {
			result.current.handleBack();
		});

		expect(mockOnBack).toHaveBeenCalledTimes(1);
		expect(mockOnCancel).not.toHaveBeenCalled();
	});

	it("should call onCancel when activeTab is not LedgerImportStep and only onCancel is provided", async () => {
		const { result } = renderHook(() =>
			useLedgerTabsHandleBack({
				activeTab: LedgerTabStep.ListenLedgerStep,
				setShowRetry: mockSetShowRetry,
				setActiveTab: mockSetActiveTab,
				onStepChange: mockOnStepChange,
				onCancel: mockOnCancel,
			}),
		);

		act(() => {
			result.current.handleBack();
		});

		expect(mockOnCancel).toHaveBeenCalledTimes(1);
		expect(mockOnBack).not.toHaveBeenCalled();
	});

	it("should call onBack over onCancel when both are provided and not at import step", async () => {
		const { result } = renderHook(() =>
			useLedgerTabsHandleBack({
				activeTab: LedgerTabStep.LedgerConnectionStep,
				setShowRetry: mockSetShowRetry,
				setActiveTab: mockSetActiveTab,
				onStepChange: mockOnStepChange,
				onBack: mockOnBack,
				onCancel: mockOnCancel,
			}),
		);

		act(() => {
			result.current.handleBack();
		});

		expect(mockOnBack).toHaveBeenCalledTimes(1);
		expect(mockOnCancel).not.toHaveBeenCalled();
	});

	it("should go back to LedgerScanStep when activeTab is LedgerImportStep", async () => {
		const { result } = renderHook(() =>
			useLedgerTabsHandleBack({
				activeTab: LedgerTabStep.LedgerImportStep,
				setShowRetry: mockSetShowRetry,
				setActiveTab: mockSetActiveTab,
				onStepChange: mockOnStepChange,
				onBack: mockOnBack,
				onCancel: mockOnCancel,
			}),
		);

		act(() => {
			result.current.handleBack();
		});

		expect(mockSetActiveTab).toHaveBeenCalledWith(LedgerTabStep.LedgerScanStep);
		expect(mockOnStepChange).toHaveBeenCalledWith(LedgerTabStep.LedgerScanStep);
		expect(mockOnBack).not.toHaveBeenCalled();
		expect(mockOnCancel).not.toHaveBeenCalled();
	});

	it("should not call onBack when activeTab is LedgerImportStep even if provided", async () => {
		const { result } = renderHook(() =>
			useLedgerTabsHandleBack({
				activeTab: LedgerTabStep.LedgerImportStep,
				setShowRetry: mockSetShowRetry,
				setActiveTab: mockSetActiveTab,
				onStepChange: mockOnStepChange,
				onBack: mockOnBack,
				onCancel: mockOnCancel,
			}),
		);

		act(() => {
			result.current.handleBack();
		});

		expect(mockOnBack).not.toHaveBeenCalled();
		expect(mockOnCancel).not.toHaveBeenCalled();
	});

	it("should set activeTab to LedgerScanStep when at import step", async () => {
		const { result } = renderHook(() =>
			useLedgerTabsHandleBack({
				activeTab: LedgerTabStep.LedgerImportStep,
				setShowRetry: mockSetShowRetry,
				setActiveTab: mockSetActiveTab,
				onStepChange: mockOnStepChange,
				onCancel: mockOnCancel,
			}),
		);

		act(() => {
			result.current.handleBack();
		});

		expect(mockSetActiveTab).toHaveBeenCalledWith(LedgerTabStep.LedgerScanStep);
	});
});
