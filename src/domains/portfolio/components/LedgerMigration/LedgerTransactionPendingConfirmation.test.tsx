import {
	env,
	getMainsailProfileId,
	mockNanoSTransport,
	render,
	screen,
	waitFor,
} from "@/utils/testing-library";
import { expect, it, describe, beforeAll, vi } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { LedgerTransactionPendingConfirmation } from "./LedgerTransactionPendingConfirmation";
import { LedgerMigrator } from "@/app/lib/mainsail/ledger.migrator";
import { createLedgerMocks } from "@/tests/mocks/Ledger";

vi.mock("@/domains/transaction/components/TransactionSuccessful/hooks/useConfirmedTransaction", () => ({
	useConfirmedTransaction: vi.fn().mockReturnValue({
		isConfirmed: false,
		transaction: undefined,
	}),
}));

describe("LedgerTransactionPendingConfirmation", () => {
	let profile: Contracts.IProfile;
	let migrator: LedgerMigrator;
	const route = `/profiles/${getMainsailProfileId()}/dashboard`;

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

	it("should render LedgerTransactionOverview when migrator has multiple transactions", async () => {
		const onConfirmed = vi.fn();
		const onGoToPortfolio = vi.fn();

		render(
			<LedgerTransactionPendingConfirmation
				migrator={migrator}
				profile={profile}
				transfer={migrator.transactions()[0]}
				onConfirmed={onConfirmed}
				onGoToPortfolio={onGoToPortfolio}
			/>,
			{ route },
		);

		await waitFor(() => {
			expect(screen.getByTestId("LedgerMigration__Review-step")).toBeInTheDocument();
		});

		expect(screen.getByText("out of 2")).toBeInTheDocument();
	});
});
