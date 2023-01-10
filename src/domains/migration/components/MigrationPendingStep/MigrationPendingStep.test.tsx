import React from "react";
import { createHashHistory } from "history";
import userEvent from "@testing-library/user-event";
import { Route } from "react-router-dom";
import { MigrationPendingStep } from "./MigrationPendingStep";
import { renderResponsiveWithRoute, env, getDefaultProfileId, screen } from "@/utils/testing-library";
import { useTheme } from "@/app/hooks/use-theme";

const history = createHashHistory();
let migrationUrl: string;

describe("MigrationPendingStep", () => {
	beforeAll(() => {
		migrationUrl = `/profiles/${getDefaultProfileId()}/migration/add`;
		history.push(migrationUrl);
	});

	it.each(["xs", "sm"])("should render in %s", (breakpoint) => {
		const { asFragment } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/migration/add">
				<MigrationPendingStep />
			</Route>,
			breakpoint,
			{
				history,
				route: migrationUrl,
			},
		);

		userEvent.click(screen.getByTestId("BackToDashboard__button"));

		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "sm"])("should render in %s in dark mode", (breakpoint) => {
		useTheme().setTheme("dark");

		const { asFragment } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/migration/add">
				<MigrationPendingStep />
			</Route>,
			breakpoint,
			{
				history,
				route: migrationUrl,
			},
		);

		userEvent.click(screen.getByTestId("BackToDashboard__button"));

		expect(asFragment()).toMatchSnapshot();
	});
});
