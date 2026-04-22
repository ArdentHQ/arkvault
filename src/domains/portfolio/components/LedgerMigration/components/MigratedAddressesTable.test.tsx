import {
	env,
	getMainsailProfileId,
	mockNanoSTransport,
	render,
	screen,
	waitFor,
	renderResponsiveWithRoute,
	renderResponsive,
} from "@/utils/testing-library";
import { expect, it, describe, vi } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { MigratedAddressesTable } from "./MigratedAddressesTable";
import { LedgerMigrator } from "@/app/lib/mainsail/ledger.migrator";
import { createLedgerMocks } from "@/tests/mocks/Ledger";
import userEvent from "@testing-library/user-event";

describe("MigratedAddressesTable", () => {
	let profile: Contracts.IProfile;
	const route = `/profiles/${getMainsailProfileId()}/dashboard`;
	let migrator: LedgerMigrator;

	beforeAll(async () => {
		mockNanoSTransport();

		profile = env.profiles().findById(getMainsailProfileId());
		await env.profiles().restore(profile);

		const publicKeyPaths = new Map([
			["m/44'/1'/1'/0/0", profile.wallets().first().publicKey()!],
			["m/44'/1'/1'/0/1", profile.wallets().last().publicKey()!],
		]);

		createLedgerMocks(profile.wallets().first(), publicKeyPaths);
		migrator = new LedgerMigrator({ env, profile: env.profiles().first() });

		await migrator.createTransactions([
			{
				address: profile.wallets().first().address(),
				path: "m/44'/1'/1'/0/0",
			},
			{
				address: profile.wallets().last().address(),
				path: "m/44'/1'/1'/0/1",
			},
		]);
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	it("should render", async () => {
		render(<MigratedAddressesTable profile={profile} transactions={migrator.transactions()} />, { route });
		expect(screen.getByTestId("MigratedAddressesTable")).toBeInTheDocument();
	});

	it("should render mobile", async () => {
		renderResponsiveWithRoute(
			<MigratedAddressesTable profile={profile} transactions={migrator.transactions()} />,
			"xs",
			{ route },
		);
		expect(screen.getByTestId("MigratedAddressesTable")).toBeInTheDocument();
		expect(screen.getAllByTestId("MigratedAddressRowMobile")).toHaveLength(2);
	});

	it("should open edit wallet modal and cancel", async () => {
		renderResponsive(<MigratedAddressesTable profile={profile} transactions={migrator.transactions()} />, "lg");

		await waitFor(() => {
			expect(screen.getByTestId("MigratedAddressesTable")).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getAllByTestId("MigratedAddressRow_edit-button")).toHaveLength(2);
		});

		await userEvent.click(screen.getAllByTestId("MigratedAddressRow_edit-button").at(0));

		await waitFor(() => {
			expect(screen.getByTestId("UpdateWalletName__input")).toBeInTheDocument();
		});

		const cancelButton = screen.queryByTestId("UpdateWalletName__cancel-button");
		if (cancelButton) {
			await userEvent.click(cancelButton);
		} else {
			await userEvent.type(screen.getByTestId("UpdateWalletName__input"), "{Escape}");
		}

		await waitFor(() => {
			expect(screen.queryByTestId("UpdateWalletName__input")).not.toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByTestId("MigratedAddressesTable")).toBeInTheDocument();
		});
	});

	it("should open edit wallet modal and save wallet name", async () => {
		renderResponsive(<MigratedAddressesTable profile={profile} transactions={migrator.transactions()} />, "lg");

		await waitFor(() => {
			expect(screen.getByTestId("MigratedAddressesTable")).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getAllByTestId("MigratedAddressRow_edit-button")).toHaveLength(2);
		});

		await userEvent.click(screen.getAllByTestId("MigratedAddressRow_edit-button").at(0));

		await waitFor(() => {
			expect(screen.getByTestId("UpdateWalletName__input")).toBeInTheDocument();
		});

		const input = screen.getByTestId("UpdateWalletName__input");
		await userEvent.clear(input);
		await userEvent.type(input, "Test Wallet");

		await waitFor(() => {
			expect(screen.getByTestId("UpdateWalletName__submit")).toBeEnabled();
		});

		await userEvent.click(screen.getByTestId("UpdateWalletName__submit"));

		await waitFor(() => {
			expect(screen.queryByTestId("UpdateWalletName__input")).not.toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByTestId("MigratedAddressesTable")).toBeInTheDocument();
		});
	});
});