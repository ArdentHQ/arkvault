import { renderHook } from "@testing-library/react";
import { useOnFailed } from "./LedgerTabs.blocks";

describe("useOnFailed", () => {
	it("should call setShowRetry(true) and registerRetry with goToPreviousStep callback", () => {
		const mockSetShowRetry = vi.fn();
		const mockGoToPreviousStep = vi.fn();
		const mockRegisterRetry = vi.fn();

		const { result } = renderHook(() =>
			useOnFailed({
				goToPreviousStep: mockGoToPreviousStep,
				registerRetry: mockRegisterRetry,
				setShowRetry: mockSetShowRetry,
			}),
		);

		result.current.onFailed();

		expect(mockSetShowRetry).toHaveBeenCalledWith(true);
		expect(mockRegisterRetry).toHaveBeenCalledTimes(1);

		const registeredCallback = mockRegisterRetry.mock.calls[0][0];
		registeredCallback?.();
		expect(mockGoToPreviousStep).toHaveBeenCalledTimes(1);
	});
});
