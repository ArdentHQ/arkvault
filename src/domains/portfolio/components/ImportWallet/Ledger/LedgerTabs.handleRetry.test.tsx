import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@/utils/testing-library";

import { useLedgerTabsHandleRetry } from "./LedgerTabs.blocks";

describe("useLedgerTabsHandleRetry", () => {
	const mockGoToPreviousStep = vi.fn();
	const mockRetryCallback = vi.fn();

	let retryRef: React.MutableRefObject<(() => void) | undefined>;

	beforeEach(() => {
		vi.clearAllMocks();
		retryRef = { current: undefined };
		mockGoToPreviousStep.mockReset();
		mockRetryCallback.mockReset();
	});

	it("should call goToPreviousStep when no retry callback is registered", () => {
		const { result } = renderHook(() =>
			useLedgerTabsHandleRetry({
				goToPreviousStep: mockGoToPreviousStep,
				retryFunctionReference: retryRef,
			}),
		);

		act(() => {
			result.current.handleRetry();
		});

		expect(mockGoToPreviousStep).toHaveBeenCalledTimes(1);
		expect(mockRetryCallback).not.toHaveBeenCalled();
	});

	it("should call the registered retry callback when one exists", () => {
		retryRef.current = mockRetryCallback;

		const { result } = renderHook(() =>
			useLedgerTabsHandleRetry({
				goToPreviousStep: mockGoToPreviousStep,
				retryFunctionReference: retryRef,
			}),
		);

		act(() => {
			result.current.handleRetry();
		});

		expect(mockRetryCallback).toHaveBeenCalledTimes(1);
		expect(mockGoToPreviousStep).not.toHaveBeenCalled();
	});

	it("should prefer the retry callback over goToPreviousStep", () => {
		retryRef.current = mockRetryCallback;

		const { result } = renderHook(() =>
			useLedgerTabsHandleRetry({
				goToPreviousStep: mockGoToPreviousStep,
				retryFunctionReference: retryRef,
			}),
		);

		act(() => {
			result.current.handleRetry();
		});

		expect(mockRetryCallback).toHaveBeenCalledTimes(1);
		expect(mockGoToPreviousStep).not.toHaveBeenCalled();
	});

	it("should call goToPreviousStep when retry callback is null", () => {
		retryRef.current = undefined;

		const { result } = renderHook(() =>
			useLedgerTabsHandleRetry({
				goToPreviousStep: mockGoToPreviousStep,
				retryFunctionReference: retryRef,
			}),
		);

		act(() => {
			result.current.handleRetry();
		});

		expect(mockGoToPreviousStep).toHaveBeenCalledTimes(1);
	});

	it("should call goToPreviousStep when retry callback is undefined", () => {
		retryRef.current = undefined;

		const { result } = renderHook(() =>
			useLedgerTabsHandleRetry({
				goToPreviousStep: mockGoToPreviousStep,
				retryFunctionReference: retryRef,
			}),
		);

		act(() => {
			result.current.handleRetry();
		});

		expect(mockGoToPreviousStep).toHaveBeenCalledTimes(1);
	});
});
