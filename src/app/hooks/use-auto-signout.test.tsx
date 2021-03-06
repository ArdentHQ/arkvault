/* eslint-disable @typescript-eslint/require-await */
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";
import { useAutoSignOut } from "@/app/hooks/use-auto-signout";
import { act, env, getDefaultProfileId, render, screen } from "@/utils/testing-library";

const history = createHashHistory();

describe("useAutoSignOut", () => {
	beforeEach(async () => {
		const profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();
	});

	afterEach(() => {
		jest.clearAllTimers();
		jest.useRealTimers();
	});

	it("should redirect to home when idle", () => {
		process.env.IDLE_TIME_THRESHOLD = "0";
		jest.useFakeTimers();

		const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;
		history.push(dashboardURL);

		const profile = env.profiles().findById(getDefaultProfileId());

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

		userEvent.click(screen.getByTestId("StartIdleTimer"));

		act(() => {
			jest.advanceTimersByTime(1000);
		});

		expect(history.location.pathname).toBe("/");

		jest.useRealTimers();
	});

	it("should not redirect if already in home", () => {
		process.env.IDLE_TIME_THRESHOLD = "0";
		jest.useFakeTimers();

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

		userEvent.click(screen.getByTestId("StartIdleTimer"));

		act(() => {
			jest.advanceTimersByTime(1000);
		});

		expect(history.location.pathname).toBe("/");

		jest.useRealTimers();
	});
});
