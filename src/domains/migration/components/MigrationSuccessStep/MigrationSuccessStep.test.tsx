import React from "react";
import { createHashHistory } from "history";
import userEvent from "@testing-library/user-event";
import { Route } from "react-router-dom";
import { MigrationSuccessStep } from "./MigrationSuccessStep";
import { renderResponsiveWithRoute, getDefaultProfileId, screen } from "@/utils/testing-library";

const history = createHashHistory();
let migrationUrl: string;

describe("MigrationSuccessStep", () => {
	beforeAll(() => {
		migrationUrl = `/profiles/${getDefaultProfileId()}/migration/add`;
		history.push(migrationUrl);
	});

	it.each(["xs", "sm"])("should render in %s", (breakpoint) => {
		renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/migration/add">
				<MigrationSuccessStep />
			</Route>,
			breakpoint,
			{
				history,
				route: migrationUrl,
			},
		);

		expect(screen.getByTestId("BackToDashboard__button")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("BackToDashboard__button"));
	});
});
