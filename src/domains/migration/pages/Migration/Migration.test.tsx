import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import { Route } from "react-router-dom";
import { Migration } from "./Migration";
import { render, screen, env, getDefaultProfileId } from "@/utils/testing-library";

let profile: Contracts.IProfile;

const history = createHashHistory();

const renderComponent = (profileId = profile.id()) => {
	const migrationUrl = `/profiles/${profileId}/migration`;
	history.push(migrationUrl);

	return render(
		<Route path="/profiles/:profileId/migration">
			<Migration />
		</Route>,
		{
			history,
			route: migrationUrl,
		},
	);
};

describe("Migration", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	it("should render", () => {
		const { asFragment } = renderComponent();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should have add button", () => {
		renderComponent();

		// Not testing the button handler since is not implemented yet
		userEvent.click(screen.getByTestId("Migrations__add-migration-btn"));
	});
});
