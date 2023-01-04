import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";
import { Route } from "react-router-dom";
import { MigrationConnectStep } from "./MigrationConnectStep";
import { translations as migrationTranslations } from "@/domains/migration/i18n";
import { render, screen, env, getDefaultProfileId } from "@/utils/testing-library";

let profile: Contracts.IProfile;

const history = createHashHistory();

const renderComponent = (profileId = profile.id()) => {
	const migrationUrl = `/profiles/${profileId}/migration/add`;
	history.push(migrationUrl);

	return render(
		<Route path="/profiles/:profileId/migration/add">
			<MigrationConnectStep />
		</Route>,
		{
			history,
			route: migrationUrl,
		},
	);
};

describe("MigrationConnectStep", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	it("should render ", () => {
		renderComponent();
		expect(screen.getByText(migrationTranslations.MIGRATION_ADD.STEP_CONNECT.FORM.ARK_ADDRESS)).toBeInTheDocument();
		expect(
			screen.getByText(migrationTranslations.MIGRATION_ADD.STEP_CONNECT.FORM.AMOUNT_YOU_SEND),
		).toBeInTheDocument();
		expect(
			screen.getByText(migrationTranslations.MIGRATION_ADD.STEP_CONNECT.FORM.POLYGON_MIGRATION_ADDRESS),
		).toBeInTheDocument();
		expect(
			screen.getByText(migrationTranslations.MIGRATION_ADD.STEP_CONNECT.FORM.AMOUNT_YOU_GET),
		).toBeInTheDocument();
	});

	// @TODO: handle cases where needs to connect metamask and select polygon network once implemented
});
