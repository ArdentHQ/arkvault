import { env, getMainsailProfileId, mockNanoSTransport, render, screen } from "@/utils/testing-library";
import { expect, it, describe, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { Contracts } from "@/app/lib/profiles";
import { MigratedAddressRowMobile } from "./MigratedAddressRowMobile";
import { LedgerMigrator } from "@/app/lib/mainsail/ledger.migrator";
import { createLedgerMocks } from "@/tests/mocks/Ledger";

describe("MigratedAddressRow", () => {
	let profile: Contracts.IProfile;
	const route = `/profiles/${getMainsailProfileId()}/dashboard`;

	beforeEach(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		await env.profiles().restore(profile);
	});

	it("should render", async () => {
		mockNanoSTransport();
		const migrator = new LedgerMigrator({ env, profile: env.profiles().first() });
		const publicKeyPaths = new Map([
			["m/44'/1'/1'/0/0", profile.wallets().first().publicKey()!],
			["m/44'/1'/1'/0/1", profile.wallets().last().publicKey()!],
		]);

		const ledgerMocks = createLedgerMocks(profile.wallets().first(), publicKeyPaths);

		await migrator.createTransactions([
			{
				address: profile.wallets().first().address(),
				path: "m/44'/1'/1'/0/0",
			},
		]);

		render(<MigratedAddressRowMobile profile={profile} transaction={migrator.transactions().at(0)!} />, { route });
		expect(screen.getByTestId("MigratedAddressRowMobile")).toBeInTheDocument();

		ledgerMocks.restoreAll();
	});

	it("should render in edit mode", async () => {
		mockNanoSTransport();
		const migrator = new LedgerMigrator({ env, profile: env.profiles().first() });
		const publicKeyPaths = new Map([["m/44'/1'/1'/0/0", profile.wallets().first().publicKey()!]]);

		const ledgerMocks = createLedgerMocks(profile.wallets().first(), publicKeyPaths);

		await migrator.createTransactions([
			{
				address: profile.wallets().first().address(),
				path: "m/44'/1'/1'/0/0",
			},
		]);

		render(<MigratedAddressRowMobile profile={profile} transaction={migrator.transactions().at(0)!} />, {
			route,
		});
		await userEvent.click(screen.getByText("Edit"));
		expect(screen.getByTestId("UpdateWalletName__input")).toBeInTheDocument();

		ledgerMocks.restoreAll();
	});

	it("should close edit mode on cancel", async () => {
		mockNanoSTransport();
		const migrator = new LedgerMigrator({ env, profile: env.profiles().first() });
		const publicKeyPaths = new Map([["m/44'/1'/1'/0/0", profile.wallets().first().publicKey()!]]);

		const ledgerMocks = createLedgerMocks(profile.wallets().first(), publicKeyPaths);

		await migrator.createTransactions([
			{
				address: profile.wallets().first().address(),
				path: "m/44'/1'/1'/0/0",
			},
		]);

		render(<MigratedAddressRowMobile profile={profile} transaction={migrator.transactions().at(0)!} />, {
			route,
		});
		await userEvent.click(screen.getByText("Edit"));
		expect(screen.getByTestId("UpdateWalletName__input")).toBeInTheDocument();

		await userEvent.click(screen.getByText("Cancel"));
		expect(screen.queryByTestId("UpdateWalletName__input")).not.toBeInTheDocument();

		ledgerMocks.restoreAll();
	});

	it("should save wallet name", async () => {
		mockNanoSTransport();
		const migrator = new LedgerMigrator({ env, profile: env.profiles().first() });
		const publicKeyPaths = new Map([["m/44'/1'/1'/0/0", profile.wallets().first().publicKey()!]]);

		const ledgerMocks = createLedgerMocks(profile.wallets().first(), publicKeyPaths);

		await migrator.createTransactions([
			{
				address: profile.wallets().first().address(),
				path: "m/44'/1'/1'/0/0",
			},
		]);

		render(<MigratedAddressRowMobile profile={profile} transaction={migrator.transactions().at(0)!} />, {
			route,
		});
		await userEvent.click(screen.getByText("Edit"));
		expect(screen.getByTestId("UpdateWalletName__input")).toBeInTheDocument();

		await userEvent.type(screen.getByTestId("UpdateWalletName__input"), "UpdatedWallet");
		await userEvent.click(screen.getByText("Save"));
		expect(screen.queryByTestId("UpdateWalletName__input")).not.toBeInTheDocument();

		ledgerMocks.restoreAll();
	});

	it("should trigger onCancel callback from UpdateWalletNameForm", async () => {
		mockNanoSTransport();
		const migrator = new LedgerMigrator({ env, profile: env.profiles().first() });
		const publicKeyPaths = new Map([["m/44'/1'/1'/0/0", profile.wallets().first().publicKey()!]]);

		const ledgerMocks = createLedgerMocks(profile.wallets().first(), publicKeyPaths);

		await migrator.createTransactions([
			{
				address: profile.wallets().first().address(),
				path: "m/44'/1'/1'/0/0",
			},
		]);

		render(<MigratedAddressRowMobile profile={profile} transaction={migrator.transactions().at(0)!} />, {
			route,
		});
		await userEvent.click(screen.getByText("Edit"));
		expect(screen.getByTestId("UpdateWalletName__input")).toBeInTheDocument();

		await userEvent.click(screen.getByText("Cancel"));
		expect(screen.queryByTestId("UpdateWalletName__input")).not.toBeInTheDocument();

		ledgerMocks.restoreAll();
	});
});
