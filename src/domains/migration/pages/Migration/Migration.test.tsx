import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import { Route } from "react-router-dom";
import { Migration } from "./Migration";
import { render, screen, env, getDefaultProfileId, waitFor, within } from "@/utils/testing-library";
import { MigrationTransactionStatus } from "@/domains/migration/migration.contracts";
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

let useMigrationsSpy: vi.SpyInstance;

describe("Migration", () => {
	const addMigrationButton = "Migrations__add-migration-btn";

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		useMigrationsSpy = vi.spyOn(context, "useMigrations").mockReturnValue({ migrations: [] });
	});

	afterAll(() => {
		useMigrationsSpy.mockRestore();
	});

	it("should render", () => {
		renderComponent();

		expect(screen.getByTestId(addMigrationButton)).toBeInTheDocument();
	});

	it("should render compact", () => {
		profile.settings().set(Contracts.ProfileSetting.UseExpandedTables, true);

		renderComponent();
		expect(screen.getByTestId(addMigrationButton)).toBeInTheDocument();

		profile.settings().set(Contracts.ProfileSetting.UseExpandedTables, false);
	});

	it("should redirect user to migration add page after accepted disclaimer", () => {
		renderComponent();

		userEvent.click(screen.getByTestId(addMigrationButton));

		expect(screen.getByTestId("MigrationDisclaimer__submit-button")).toBeVisible();

		userEvent.click(screen.getByTestId("MigrationDisclaimer-checkbox"));

		expect(screen.getByTestId("MigrationDisclaimer__submit-button")).not.toBeDisabled();

		userEvent.click(screen.getByTestId("MigrationDisclaimer__submit-button"));

		expect(history.location.pathname).toBe(`/profiles/${profile.id()}/migration/add`);
	});

	it("handles the cancel button on the disclaimer", async () => {
		renderComponent();

		userEvent.click(screen.getByTestId(addMigrationButton));

		expect(screen.getByTestId("MigrationDisclaimer__cancel-button")).toBeVisible();

		userEvent.click(screen.getByTestId("MigrationDisclaimer__cancel-button"));

		await waitFor(() => expect(screen.queryByTestId("MigrationDisclaimer__cancel-button")).not.toBeInTheDocument());
	});

	it("shows a warning and disables the add button if contract is paused", () => {
		useMigrationsSpy = vi.spyOn(context, "useMigrations").mockReturnValue({
			contractIsPaused: true,
		});

		renderComponent();

		expect(screen.getByTestId(addMigrationButton)).toBeDisabled();

		expect(screen.getByTestId("ContractPausedAlert")).toBeInTheDocument();

		useMigrationsSpy.mockRestore();
	});

	it("handles the close button on the disclaimer", async () => {
		renderComponent();

		userEvent.click(screen.getByTestId(addMigrationButton));

		expect(screen.getByTestId("Modal__close-button")).toBeVisible();

		userEvent.click(screen.getByTestId("Modal__close-button"));

		await waitFor(() => expect(screen.queryByTestId("Modal__close-button")).not.toBeInTheDocument());
	});

	it("should display and hide details of migration transaction", async () => {
		const wallet = profile.wallets().first();
		const walletCreationSpy = vi.spyOn(profile.walletFactory(), "fromAddress").mockResolvedValue(wallet);

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

		vi.spyOn(wallet.transactionIndex(), "received").mockResolvedValue({
			currentPage: () => 1,
			items: () => [transactionFixture, secondTransactionFixture],
		});

		useMigrationsSpy = vi.spyOn(context, "useMigrations").mockReturnValue({
			migrations: [
				{
					address: "AdDreSs",
					amount: 123,
					id: transactionFixture.id(),
					migrationAddress: "0x456",
					status: MigrationTransactionStatus.Confirmed,
					timestamp: Date.now() / 1000,
				},
			],
			storeTransaction: () => {},
		});

		renderComponent();

		await waitFor(() => {
			expect(screen.getAllByTestId("MigrationTransactionsRow")[0]).toBeInTheDocument();
		});

		userEvent.click(within(screen.getAllByTestId("MigrationTransactionsRow")[0]).getAllByRole("button")[0]);

		useMigrationsSpy.mockRestore();
		walletCreationSpy.mockRestore();

		await waitFor(() => {
			expect(screen.getByTestId("MigrationDetails")).toBeInTheDocument();
		});

		userEvent.click(screen.getByTestId("MigrationAdd__back-to-dashboard-button"));

		await waitFor(() => {
			expect(screen.queryByTestId("MigrationDetails")).not.toBeInTheDocument();
		});
	});
});
