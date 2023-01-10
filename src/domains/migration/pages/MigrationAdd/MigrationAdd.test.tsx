import React from "react";
import { createHashHistory } from "history";
import { Route } from "react-router-dom";
import { MigrationAdd, Step } from "./MigrationAdd";
import { render, getDefaultProfileId, screen } from "@/utils/testing-library";
import { translations as migrationTranslations } from "@/domains/migration/i18n";

const history = createHashHistory();

const renderComponent = (activeStep?: Step) => {
	const migrationUrl = `/profiles/${getDefaultProfileId()}/migration/add`;
	history.push(migrationUrl);

	return render(
		<Route path="/profiles/:profileId/migration/add">
			<MigrationAdd initialActiveStep={activeStep} />
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

	it("should render review step", () => {
		renderComponent(Step.Review);

		expect(screen.getByTestId("header__title")).toBeInTheDocument();

		expect(screen.getByTestId("header__title")).toHaveTextContent(
			migrationTranslations.MIGRATION_ADD.STEP_REVIEW.TITLE,
		);
	});

	it("should render authentication step", () => {
		const { asFragment } = renderComponent(Step.Authenticate);

		expect(screen.getByTestId("header__title")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
