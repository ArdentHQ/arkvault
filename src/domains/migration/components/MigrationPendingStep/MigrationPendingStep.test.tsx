import React from "react";
import { createHashHistory } from "history";
import { DTO } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { Route } from "react-router-dom";
import { MigrationPendingStep } from "./MigrationPendingStep";
import { renderResponsiveWithRoute, render, getDefaultProfileId, screen, env } from "@/utils/testing-library";
import { MigrationTransactionStatus } from "@/domains/migration/migration.contracts";
import { useTheme } from "@/app/hooks/use-theme";

const history = createHashHistory();
let migrationUrl: string;
let transactionFixture: DTO.ExtendedSignedTransactionData;
let migrationFixture;

describe("MigrationPendingStep", () => {
	beforeAll(async () => {
		const profile = env.profiles().findById(getDefaultProfileId());
		const wallet = profile.wallets().first();

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

		transactionFixture = new DTO.ExtendedSignedTransactionData(
			await wallet
				.coin()
				.transaction()
				.transfer({
					data: {
						amount: 1,
						to: wallet.address(),
					},
					fee: 1,
					nonce: "1",
					signatory: await wallet
						.coin()
						.signatory()
						.multiSignature({
							min: 2,
							publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!],
						}),
				}),
			wallet,
		);
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

		userEvent.click(screen.getByTestId("MigrationAdd_back"));

		expect(history.location.pathname).toBe(`/profiles/${profile.id()}/dashboard`);
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

		userEvent.click(screen.getByTestId("MigrationAdd_back"));

		expect(handleBack).toHaveBeenCalled();
	});
});
