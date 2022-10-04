import { act as hookAct, renderHook } from "@testing-library/react-hooks";
import userEvent from "@testing-library/user-event";
import React, { useEffect } from "react";

import { useSynchronizer } from "./use-synchronizer";
import { ConfigurationProvider, EnvironmentProvider } from "@/app/contexts";
import { act, env, render, screen, waitFor } from "@/utils/testing-library";

const wrapper = ({ children }: any) => (
	<EnvironmentProvider env={env}>
		<ConfigurationProvider>{children}</ConfigurationProvider>
	</EnvironmentProvider>
);

describe("Synchronizer Hook", () => {
	let onCall: vi.Mock;

	const job1 = vi.fn(() => Promise.resolve(onCall(1)));
	const job2 = vi.fn(() => Promise.resolve(onCall(2)));
	const jobs = [
		{
			callback: job1,
			interval: 100,
		},
		{
			callback: job2,
			interval: 50,
		},
	];

	beforeEach(() => {
		vi.useFakeTimers();
		onCall = vi.fn();
	});

	it("should stop jobs", async () => {
		const clearIntervalSpy = vi.spyOn(window, "clearInterval").mockImplementation(vi.fn());

		const Component = () => {
			const { start, stop } = useSynchronizer(jobs);

			useEffect(() => {
				start();
			}, [start]);

			return <button onClick={() => stop()}>Stop</button>;
		};

		render(<Component />);

		vi.advanceTimersByTime(200);

		await waitFor(() => expect(onCall).toHaveBeenCalledTimes(6));

		userEvent.click(screen.getByRole("button"));

		await waitFor(() => expect(clearInterval).toHaveBeenCalledTimes(2));

		clearIntervalSpy.mockRestore();
	});

	it("should stop jobs and clear timers", async () => {
		const clearIntervalSpy = vi.spyOn(window, "clearInterval").mockImplementation(vi.fn());

		const Component = () => {
			const { start, stop } = useSynchronizer(jobs);

			useEffect(() => {
				start();
			}, [start]);

			return <button onClick={() => stop({ clearTimers: true })}>Stop</button>;
		};

		render(<Component />);

		vi.advanceTimersByTime(200);

		await waitFor(() => expect(onCall).toHaveBeenCalledTimes(6));

		userEvent.click(screen.getByRole("button"));

		await waitFor(() => expect(clearInterval).toHaveBeenCalledTimes(2));

		clearIntervalSpy.mockRestore();
	});

	it("should run periodically", async () => {
		const clearIntervalSpy = vi.spyOn(window, "clearInterval").mockImplementation(vi.fn());

		const Component = () => {
			const { start } = useSynchronizer(jobs);

			useEffect(() => {
				start();
			}, [start]);

			return <h1>Test</h1>;
		};

		const { unmount } = render(<Component />);

		vi.advanceTimersByTime(200);

		await waitFor(() => expect(onCall).toHaveBeenCalledTimes(6));

		unmount();

		await waitFor(() => expect(clearInterval).toHaveBeenCalledTimes(2));

		clearIntervalSpy.mockRestore();
	});

	it("should catch and return errors from jobs", async () => {
		const erroringJob = vi.fn(() => Promise.reject("Some error"));

		const jobsWithErrors = [
			{
				callback: erroringJob,
				interval: 50,
			},
		];

		const { result, waitForNextUpdate } = renderHook(() => useSynchronizer(jobsWithErrors), { wrapper });

		act(() => {
			result.current.runAll();
		});

		await waitForNextUpdate();

		await waitFor(() =>
			expect(result.current.error).toStrictEqual({ error: "Some error", timestamp: expect.any(Number) }),
		);
	});

	it("should clear errors", async () => {
		const erroringJob = vi.fn(() => Promise.reject("Some error"));

		const jobsWithErrors = [
			{
				callback: erroringJob,
				interval: 50,
			},
		];

		const { result, waitForNextUpdate } = renderHook(() => useSynchronizer(jobsWithErrors), { wrapper });

		hookAct(() => {
			result.current.runAll();
		});

		await waitForNextUpdate();

		expect(result.current.error).toStrictEqual({ error: "Some error", timestamp: expect.any(Number) });

		hookAct(() => {
			result.current.clearError();
		});

		await waitFor(() => expect(result.current.error).toBeUndefined());
	});
});
