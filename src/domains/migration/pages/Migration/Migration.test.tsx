import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import { Route } from "react-router-dom";
import { Migration } from "./Migration";
import { render, screen, env, getDefaultProfileId, waitFor, within } from "@/utils/testing-library";
import { MigrationTransactionStatus, Migration as MigrationType } from "@/domains/migration/migration.contracts";
import * as context from "@/app/contexts";
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

	it("should render compact", () => {
		profile.settings().set(Contracts.ProfileSetting.UseExpandedTables, true);

		const { asFragment } = renderComponent();

		expect(asFragment()).toMatchSnapshot();

		profile.settings().set(Contracts.ProfileSetting.UseExpandedTables, false);
	});

	it("should redirect user to migration add page after accepted disclaimer", () => {
		renderComponent();

		userEvent.click(screen.getByTestId("Migrations__add-migration-btn"));

		expect(screen.getByTestId("MigrationDisclaimer__submit-button")).toBeVisible();

		userEvent.click(screen.getByTestId("MigrationDisclaimer-checkbox"));

		expect(screen.getByTestId("MigrationDisclaimer__submit-button")).not.toBeDisabled();

		userEvent.click(screen.getByTestId("MigrationDisclaimer__submit-button"));

		expect(history.location.pathname).toBe(`/profiles/${profile.id()}/migration/add`);
	});

	it("handles the cancel button on the disclaimer", async () => {
		renderComponent();

		userEvent.click(screen.getByTestId("Migrations__add-migration-btn"));

		expect(screen.getByTestId("MigrationDisclaimer__cancel-button")).toBeVisible();

		userEvent.click(screen.getByTestId("MigrationDisclaimer__cancel-button"));

		await waitFor(() => expect(screen.queryByTestId("MigrationDisclaimer__cancel-button")).not.toBeInTheDocument());
	});

	it("handles the close button on the disclaimer", async () => {
		renderComponent();

		userEvent.click(screen.getByTestId("Migrations__add-migration-btn"));

		expect(screen.getByTestId("Modal__close-button")).toBeVisible();

		userEvent.click(screen.getByTestId("Modal__close-button"));

		await waitFor(() => expect(screen.queryByTestId("Modal__close-button")).not.toBeInTheDocument());
	});

	it("should display details of migration transaction", () => {
		const migrations: MigrationType[] = [
			{
				address: "AdDreSs",
				amount: 123,
				id: "0x123",
				migrationAddress: "0x456",
				status: MigrationTransactionStatus.Confirmed,
				timestamp: Date.now() / 1000,
			},
		];

		const useMigrationsSpy = vi.spyOn(context, "useMigrations").mockImplementation(() => ({ migrations }));

		renderComponent();

		userEvent.click(within(screen.getAllByTestId("TableRow")[0]).getAllByRole("button")[0]);

		useMigrationsSpy.mockRestore();

		// @TBD
	});
});
