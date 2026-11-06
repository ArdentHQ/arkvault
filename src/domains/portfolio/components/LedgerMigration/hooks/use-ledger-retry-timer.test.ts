import { act, renderHook } from "@testing-library/react";
import { expect, it, describe, vi, beforeEach, afterEach } from "vitest";

import { useLedgerRetryTimer } from "./use-ledger-retry-timer";
import * as connectionUtils from "@/app/contexts/Ledger/utils/connection";

describe("useLedgerRetryTimer", () => {
	const mockLedger = { connect: vi.fn() };
	const mockProfile = { ledger: vi.fn(() => mockLedger) };

	beforeEach(() => {
		vi.spyOn(connectionUtils, "persistLedgerConnection").mockResolvedValue(undefined);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should return initial state", () => {
		const { result } = renderHook(() => useLedgerRetryTimer({ profile: mockProfile as any }));

		expect(result.current.elapsedSeconds).toBe(0);
		expect(result.current.isRetrying).toBe(false);
		expect(result.current.shouldShowRetry).toBe(false);
	});

	it("should update elapsedSeconds over time", () => {
		vi.useFakeTimers();

		const { result } = renderHook(() => useLedgerRetryTimer({ profile: mockProfile as any }));

		expect(result.current.elapsedSeconds).toBe(0);

		act(() => {
			vi.advanceTimersByTime(1000);
		});
		expect(result.current.elapsedSeconds).toBe(1);

		act(() => {
			vi.advanceTimersByTime(5000);
		});
		expect(result.current.elapsedSeconds).toBe(6);

		vi.useRealTimers();
	});

	it("should show retry button after threshold seconds", () => {
		vi.useFakeTimers();

		const { result } = renderHook(() => useLedgerRetryTimer({ profile: mockProfile as any, thresholdSeconds: 10 }));

		expect(result.current.shouldShowRetry).toBe(false);

		act(() => {
			vi.advanceTimersByTime(9000);
		});
		expect(result.current.shouldShowRetry).toBe(false);

		act(() => {
			vi.advanceTimersByTime(1000);
		});
		expect(result.current.shouldShowRetry).toBe(true);

		vi.useRealTimers();
	});

	it("should call reset and trigger connection flow", async () => {
		const { result } = renderHook(() => useLedgerRetryTimer({ profile: mockProfile as any }));

		expect(result.current.isRetrying).toBe(false);
		expect(result.current.shouldShowRetry).toBe(false);

		await act(async () => {
			await result.current.reset();
		});

		expect(mockProfile.ledger).toHaveBeenCalled();
		expect(connectionUtils.persistLedgerConnection).toHaveBeenCalledWith({ ledgerService: mockLedger });
		expect(result.current.isRetrying).toBe(false);
		expect(result.current.elapsedSeconds).toBe(0);
	});
});
