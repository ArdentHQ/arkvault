import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { createHashHistory } from "history";
import { Route } from "react-router-dom";
import { MigrationAdd } from "./MigrationAdd";
import { render, env, getDefaultProfileId, screen } from "@/utils/testing-library";
import { translations as migrationTranslations } from "@/domains/migration/i18n";

let profile: Contracts.IProfile;

const history = createHashHistory();

const renderComponent = (profileId = profile.id()) => {
	const migrationUrl = `/profiles/${profileId}/migration/add`;
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
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	it("should render", () => {
		renderComponent();

		expect(screen.getByTestId("header__title")).toBeInTheDocument();

		expect(screen.getByTestId("header__title")).toHaveTextContent(
			migrationTranslations.MIGRATION_ADD.STEP_CONNECT.TITLE,
		);
	});
});
