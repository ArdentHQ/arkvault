import { renderHook } from "@testing-library/react";
import React from "react";
import { useTranslation } from "react-i18next";

import { TimeAgo } from "./TimeAgo";
import { render, screen } from "@/utils/testing-library";

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
});
