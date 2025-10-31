import { env, getMainsailProfileId, render, screen } from "@/utils/testing-library";
import { expect, it, describe, beforeEach } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { TransactionTable } from "./TransactionTable";
import { LedgerMigrator } from "@/app/lib/mainsail/ledger.migrator";
import { createLedgerMocks } from "@/tests/mocks/Ledger";

describe("TransactionTable", () => {
	let profile: Contracts.IProfile;
	const senderPath = "m/44'/1'/1'/0/0";
	const recipientPath = "m/44'/66'/1'/0/0";

	beforeEach(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		await env.profiles().restore(profile);

		const publicKeyPaths = new Map([
			[senderPath, profile.wallets().first().publicKey()!],
			[recipientPath, profile.wallets().last().publicKey()!],
		]);

		createLedgerMocks(profile.wallets().first(), publicKeyPaths);
	});

	it("should render", async () => {
		const migrator = new LedgerMigrator({ env, profile });

		await migrator.createTransactions([
			{
				address: profile.wallets().first().address(),
				path: senderPath,
			},
			{
				address: profile.wallets().last().address(),
				path: recipientPath,
			},
		]);

		const completedMock = vi.spyOn(migrator.transactions().at(0), "isCompleted").mockReturnValue(true);
		render(<TransactionTable transactions={migrator.transactions()} />);

		expect(screen.getAllByTestId("Link__external")).toHaveLength(1);
		completedMock.mockRestore();
	});
});
