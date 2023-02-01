import React from "react";
import { createHashHistory } from "history";
import userEvent from "@testing-library/user-event";
import { Route } from "react-router-dom";
import { MigrationPendingStep } from "./MigrationPendingStep";
import { renderResponsiveWithRoute, render, getDefaultProfileId, screen, env } from "@/utils/testing-library";
import { MigrationTransactionStatus } from "@/domains/migration/migration.contracts";
import { useTheme } from "@/app/hooks/use-theme";
import { translations } from "@/domains/migration/i18n";

const history = createHashHistory();
let migrationUrl: string;
let migrationFixture;

describe("MigrationPendingStep", () => {
	beforeAll(() => {
		migrationUrl = `/profiles/${getDefaultProfileId()}/migration/add`;
		history.push(migrationUrl);

		migrationFixture = {
			address: "AdDreSs2",
			amount: 456,
			id: "bc68f6c81b7fe5146fe9dd71424740f96909feab7a12a19fe368b7ef4d828445",
			migrationAddress: "BuRnAdDreSs",
			status: MigrationTransactionStatus.Pending,
			timestamp: Date.now() / 1000,
		};
	});

	it.each(["xs", "sm"])("should render in %s", (breakpoint) => {
		const { asFragment } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/migration/add">
				<MigrationPendingStep migrationTransaction={migrationFixture} />
			</Route>,
			breakpoint,
			{
				history,
				route: migrationUrl,
			},
		);

		expect(asFragment()).toMatchSnapshot();
	});
	it.each(["xs", "sm"])("should handle an unknown status in %s", (breakpoint) => {
		renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/migration/add">
				<MigrationPendingStep
					migrationTransaction={{
						...migrationFixture,
						status: undefined,
					}}
				/>
			</Route>,
			breakpoint,
			{
				history,
				route: migrationUrl,
			},
		);

		expect(screen.getByText(translations.DETAILS_MODAL.ERROR.TITLE)).toBeInTheDocument();
	});

	it.each(["xs", "sm"])("should render in %s in dark mode", (breakpoint) => {
		useTheme().setTheme("dark");

		const { asFragment } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/migration/add">
				<MigrationPendingStep migrationTransaction={migrationFixture} />
			</Route>,
			breakpoint,
			{
				history,
				route: migrationUrl,
			},
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should redirect to dashboard when clicking back-to-dashboard button", () => {
		const profile = env.profiles().findById(getDefaultProfileId());

		render(
			<Route path="/profiles/:profileId/migration/add">
				<MigrationPendingStep migrationTransaction={migrationFixture} />
			</Route>,
			{
				history,
				route: migrationUrl,
			},
		);

		userEvent.click(screen.getByTestId("MigrationAdd__back-button"));

		expect(history.location.pathname).toBe(`/profiles/${profile.id()}/migration`);
	});
	it("should handle custom back action", () => {
		const handleBack = vi.fn();

		render(
			<Route path="/profiles/:profileId/migration/add">
				<MigrationPendingStep migrationTransaction={migrationFixture} handleBack={handleBack} />
			</Route>,
			{
				history,
				route: migrationUrl,
			},
		);

		userEvent.click(screen.getByTestId("MigrationAdd__back-button"));

		expect(handleBack).toHaveBeenCalled();
	});
});
