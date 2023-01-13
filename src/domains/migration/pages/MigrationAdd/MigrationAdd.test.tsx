import React from "react";
import { createHashHistory } from "history";
import { Route } from "react-router-dom";
import { MigrationAdd } from "./MigrationAdd";
import { render, getDefaultProfileId, screen, env } from "@/utils/testing-library";
import { translations as migrationTranslations } from "@/domains/migration/i18n";

const history = createHashHistory();

const renderComponent = () => {
	const migrationUrl = `/profiles/${getDefaultProfileId()}/migration/add`;
	history.push(migrationUrl);

	return render(
		<Route path="/profiles/:profileId/migration/add">
			<MigrationAdd />
		</Route>,
		{
			history,
			route: migrationUrl,
		},
	);
};

describe("MigrationAdd", () => {
	it("should render", () => {
		renderComponent();

		expect(screen.getByTestId("header__title")).toBeInTheDocument();

		expect(screen.getByTestId("header__title")).toHaveTextContent(
			migrationTranslations.MIGRATION_ADD.STEP_CONNECT.TITLE,
		);
	});
});
