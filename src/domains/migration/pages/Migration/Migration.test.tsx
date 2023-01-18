import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import { Route } from "react-router-dom";
import { Migration } from "./Migration";
import { render, screen, env, getDefaultProfileId, waitFor, within } from "@/utils/testing-library";
import { MigrationTransactionStatus, Migration as MigrationType } from "@/domains/migration/migration.contracts";
import * as context from "@/app/contexts";
import * as useLatestTransactions from "@/domains/dashboard/hooks";

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

let useMigrationsSpy: vi.SpyInstance;

describe("Migration", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		useMigrationsSpy = vi.spyOn(contexts, "useMigrations").mockReturnValue({ migrations: [] });
	});

	afterAll(() => {
		useMigrationsSpy.mockRestore();
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

	it("shows a warning and disables the add button if contract is paused", () => {
		useMigrationsSpy = vi.spyOn(contexts, "useMigrations").mockReturnValue({
			contractIsPaused: true,
		});

		renderComponent();

		expect(screen.getByTestId("Migrations__add-migration-btn")).toBeDisabled();

		expect(screen.getByTestId("ContractPausedAlert")).toBeInTheDocument();

		useMigrationsSpy.mockRestore();
	});

	it("handles the close button on the disclaimer", async () => {
		renderComponent();

		userEvent.click(screen.getByTestId("Migrations__add-migration-btn"));

		expect(screen.getByTestId("Modal__close-button")).toBeVisible();

		userEvent.click(screen.getByTestId("Modal__close-button"));

		await waitFor(() => expect(screen.queryByTestId("Modal__close-button")).not.toBeInTheDocument());
	});

	it("should display details of migration transaction", async () => {
		const wallet = profile.wallets().first();
		const transactionFixture = new DTO.ExtendedSignedTransactionData(
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

		const secondTransactionFixture = new DTO.ExtendedSignedTransactionData(
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

		vi.spyOn(transactionFixture, "memo").mockReturnValue("0xb9EDE6f94D192073D8eaF85f8db677133d483249");

		vi.spyOn(useLatestTransactions, "useLatestTransactions").mockReturnValue({
			isLoadingTransactions: false,
			latestTransactions: [transactionFixture, secondTransactionFixture],
		});

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

		useMigrationsSpy = vi.spyOn(context, "useMigrations").mockReturnValue({
			migrations,

			storeTransaction: () => {},
		});

		renderComponent();

		userEvent.click(within(screen.getAllByTestId("MigrationTransactionsRow")[0]).getAllByRole("button")[0]);

		useMigrationsSpy.mockRestore();

		// @TBD
	});
});
