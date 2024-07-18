/* eslint-disable @typescript-eslint/require-await */
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";
import { useAutoSignOut } from "@/app/hooks/use-auto-signout";
import { act, env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";

const history = createHashHistory();

describe("useAutoSignOut", () => {
	beforeEach(async () => {
		const profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();
	});

	afterEach(() => {
		vi.clearAllTimers();
		vi.useRealTimers();
	});

	it("should redirect to home when idle", async () => {
		process.env.IDLE_TIME_THRESHOLD = "0";
		vi.useFakeTimers({shouldAdvanceTime: true});

		const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;
		history.push(dashboardURL);

		const profile = env.profiles().findById(getDefaultProfileId());

		vi.spyOn(profile.settings(), "get").mockReturnValue(0.001);
		const Component = () => {
			const { startIdleTimer } = useAutoSignOut(profile);
			return <div data-testid="StartIdleTimer" onClick={() => startIdleTimer()} />;
		};

		render(
			<Route path="/profiles/:profileId/dashboard">
				<Component />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(history.location.pathname).toBe(`/profiles/${profile.id()}/dashboard`);

		await userEvent.click(screen.getByTestId("StartIdleTimer"));

		act(() => {
			vi.advanceTimersByTime(1000);
		});

		await waitFor(() => {
			expect(history.location.pathname).toBe("/");
		});

		vi.useRealTimers();
	});

	it("should not redirect if already in home", async () => {
		process.env.IDLE_TIME_THRESHOLD = "0";
		vi.useFakeTimers({shouldAdvanceTime: true});

		const profile = env.profiles().findById(getDefaultProfileId());

		const Component = () => {
			const { startIdleTimer } = useAutoSignOut(profile);
			return <div data-testid="StartIdleTimer" onClick={() => startIdleTimer()} />;
		};

		render(
			<Route path="/">
				<Component />
			</Route>,
			{
				history,
				route: "/",
			},
		);

		expect(history.location.pathname).toBe("/");

		await userEvent.click(screen.getByTestId("StartIdleTimer"));

		act(() => {
			vi.advanceTimersByTime(1000);
		});

		expect(history.location.pathname).toBe("/");

		vi.useRealTimers();
	});
});
