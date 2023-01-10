import React from "react";
import { createHashHistory } from "history";
import { Route } from "react-router-dom";
import { MigrationSuccessStep } from "./MigrationSuccessStep";
import { renderResponsiveWithRoute, env, getDefaultProfileId } from "@/utils/testing-library";

const history = createHashHistory();
let migrationUrl: string;

describe("MigrationSuccessStep", () => {
	beforeAll(() => {
		migrationUrl = `/profiles/${getDefaultProfileId()}/migration/add`;
		history.push(migrationUrl);
	});

	it.each(["xs", "sm"])("should render in %s", (breakpoint) => {
		const { asFragment } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/migration/add">
				<MigrationSuccessStep />
			</Route>,
			breakpoint,
			{
				history,
				route: migrationUrl,
			},
		);

		expect(asFragment()).toMatchSnapshot();
	});
});
