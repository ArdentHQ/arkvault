import { renderHook } from "@testing-library/react";

import { useScheduler } from "./use-scheduler";

describe("useScheduler", () => {
	let handler: vi.Mock;

	beforeEach(() => {
		handler = vi.fn();
	});

	beforeAll(() => {
		vi.useFakeTimers();
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	const renderScheduler = (autostart = false) =>
		renderHook(() =>
			useScheduler({
				autostart,
				handler,
				timeout: 1000,
			}),
		);

	it("should start/stop execution of a function at each time interval", () => {
		const { result } = renderScheduler();

		expect(handler).not.toHaveBeenCalled();

		result.current.start();

		expect(handler).toHaveBeenCalledTimes(1);

		vi.advanceTimersByTime(1100);

		expect(handler).toHaveBeenCalledTimes(2);

		vi.advanceTimersByTime(1100);

		expect(handler).toHaveBeenCalledTimes(3);

		result.current.stop();

		vi.advanceTimersByTime(1100);

		expect(handler).toHaveBeenCalledTimes(3);
	});

	it("should throw error on start if job already started", () => {
		const { result } = renderScheduler();

		expect(handler).not.toHaveBeenCalled();

		result.current.start();

		expect(() => result.current.start()).toThrow("Job already started. This looks like a bug.");
	});

	it("should automatically start with autostart = true", () => {
		const { result } = renderScheduler(true);

		expect(handler).toHaveBeenCalledTimes(1);

		vi.advanceTimersByTime(1100);

		expect(handler).toHaveBeenCalledTimes(2);

		result.current.stop();

		vi.advanceTimersByTime(1100);

		expect(handler).toHaveBeenCalledTimes(2);
	});
});
