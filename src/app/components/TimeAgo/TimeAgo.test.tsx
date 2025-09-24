import { renderHook } from "@testing-library/react";
import React from "react";
import { useTranslation } from "react-i18next";

import { TimeAgo } from "./TimeAgo";
import { act, render, screen } from "@/utils/testing-library";

describe("TimeAgo", () => {
	it("should render", () => {
		const date = "2020-06-19T14:48:00.000Z";

		const { asFragment } = render(<TimeAgo date={date} />);

		expect(asFragment()).toMatchSnapshot();
	});

	it.each([
		["years", "2019-07-01T00:00:00.000Z", "YEARS_AGO"],
		["months", "2020-06-01T00:00:00.000Z", "MONTHS_AGO"],
		["days", "2020-06-30T00:00:00.000Z", "DAYS_AGO"],
		["hours", "2020-06-30T23:00:00.000Z", "HOURS_AGO"],
		["minutes", "2020-06-30T23:59:00.000Z", "MINUTES_AGO"],
	])("should render the difference in %s", (unit, date, key) => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		render(<TimeAgo date={date} />);

		expect(screen.getByTestId("TimeAgo")).toHaveTextContent(t(`COMMON.DATETIME.${key}`, { count: 1 }));
	});

	it("should render the fallback if the difference is less than a minute", () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const date = "2020-06-30T23:59:59.000Z";

		render(<TimeAgo date={date} />);

		expect(screen.getByTestId("TimeAgo")).toHaveTextContent(t("COMMON.DATETIME.FEW_SECONDS_AGO"));
	});

	it("re-renders on tick and reschedules the next update (vitest)", () => {
		vi.useFakeTimers();
		const initialNow = new Date("2020-07-01T00:00:10.000Z");
		vi.setSystemTime(initialNow);

		const date = new Date(initialNow.getTime() - 10_000).toISOString();
		const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");

		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		render(<TimeAgo date={date} />);

		expect(screen.getByTestId("TimeAgo")).toHaveTextContent(t("COMMON.DATETIME.FEW_SECONDS_AGO"));

		act(() => {
			vi.setSystemTime(new Date(initialNow.getTime() + 50_000));
			vi.advanceTimersByTime(50_000);
		});

		expect(screen.getByTestId("TimeAgo")).toHaveTextContent(t("COMMON.DATETIME.MINUTES_AGO", { count: 1 }));

		expect(setTimeoutSpy.mock.calls.length).toBeGreaterThanOrEqual(2);

		act(() => {
			vi.setSystemTime(new Date(initialNow.getTime() + 110_000));
			vi.advanceTimersByTime(60_000);
		});

		expect(screen.getByTestId("TimeAgo")).toHaveTextContent(t("COMMON.DATETIME.MINUTES_AGO", { count: 3 }));

		expect(setTimeoutSpy.mock.calls.length).toBeGreaterThanOrEqual(3);

		setTimeoutSpy.mockRestore();
		vi.useRealTimers();
	});
});
