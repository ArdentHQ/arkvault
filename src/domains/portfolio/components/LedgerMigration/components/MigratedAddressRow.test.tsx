import { env, getMainsailProfileId, mockNanoSTransport, render, screen } from "@/utils/testing-library";
import { expect, it, describe, beforeEach } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { MigratedAddressRow } from "./MigratedAddressRow";
import { LedgerMigrator } from "@/app/lib/mainsail/ledger.migrator";
import { createLedgerMocks } from "@/domains/portfolio/components/LedgerMigration/migrator-mocks";

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
		const publicKeyPaths = new Map([["m/44'/1'/1'/0/0", profile.wallets().first().publicKey()!]]);

		const ledgerMocks = createLedgerMocks(profile.wallets().first(), publicKeyPaths);

		await migrator.createTransactions([
			{
				address: profile.wallets().first().address(),
				path: "m/44'/1'/1'/0/0",
			},
		]);

		render(<MigratedAddressRow transaction={migrator.transactions().at(0)!} />, { route });
		expect(screen.getByTestId("MigratedAddressRow")).toBeInTheDocument();

		ledgerMocks.restoreAll();
	});
});
