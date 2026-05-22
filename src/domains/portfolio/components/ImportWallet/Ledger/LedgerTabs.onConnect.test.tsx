import { renderHook } from "@testing-library/react";
import { useOnConnect } from "./LedgerTabs.blocks";
import { LedgerTabStep } from "./LedgerTabs.contracts";

describe("useOnConnect", () => {
	it("should call setShowRetry(false), setActiveTab(LedgerScanStep) and onStepChange", () => {
		const mockSetShowRetry = vi.fn();
		const mockSetActiveTab = vi.fn();
		const mockOnStepChange = vi.fn();

		const { result } = renderHook(() =>
			useOnConnect({
				setShowRetry: mockSetShowRetry,
				setActiveTab: mockSetActiveTab,
				onStepChange: mockOnStepChange,
			}),
		);

		result.current.onConnect();

		expect(mockSetShowRetry).toHaveBeenCalledWith(false);
		expect(mockSetActiveTab).toHaveBeenCalledWith(LedgerTabStep.LedgerScanStep);
		expect(mockOnStepChange).toHaveBeenCalledWith(LedgerTabStep.LedgerScanStep);
	});

	it("should not call onStepChange if not provided", () => {
		const mockSetShowRetry = vi.fn();
		const mockSetActiveTab = vi.fn();

		const { result } = renderHook(() =>
			useOnConnect({
				setShowRetry: mockSetShowRetry,
				setActiveTab: mockSetActiveTab,
			}),
		);

		result.current.onConnect();

		expect(mockSetShowRetry).toHaveBeenCalledWith(false);
		expect(mockSetActiveTab).toHaveBeenCalledWith(LedgerTabStep.LedgerScanStep);
	});
});
