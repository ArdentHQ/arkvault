import { env, getMainsailProfileId, mockNanoSTransport, render, screen, waitFor } from "@/utils/testing-library";
import { expect, it, describe, beforeAll, vi } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { LedgerTransactionSuccessStep } from "./LedgerTransactionSuccessStep";
import { LedgerMigrator } from "@/app/lib/mainsail/ledger.migrator";
import { createLedgerMocks } from "@/tests/mocks/Ledger";
import { ExtendedSignedTransactionData } from "@/app/lib/profiles/signed-transaction.dto";

vi.mock("@/domains/transaction/components/TransactionSuccessful/hooks/useConfirmedTransaction", () => ({
	useConfirmedTransaction: vi.fn().mockReturnValue({
		isConfirmed: true,
		transaction: undefined,
	}),
}));

describe("LedgerTransactionSuccessStep", () => {
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

	const createTransfer = () => {
		const transfer = profile.draftTransactionFactory().transfer();
		transfer.setSender(profile.wallets().first());
		transfer.addRecipientWallet(profile.wallets().last());
		transfer.setAmount(1);
		vi.spyOn(transfer, "isCompleted").mockReturnValue(true);
		vi.spyOn(transfer, "signedTransaction").mockReturnValue({
			explorerLink: () => "https://123.com",
			hash: () => "123",
		} as ExtendedSignedTransactionData);
		return transfer;
	};

	it("should render success for single transaction", async () => {
		const onGoToPortfolio = vi.fn();
		const onGoToNextTransaction = vi.fn();

		const singleTransactionMigrator = new LedgerMigrator({ env, profile: env.profiles().first() });
		await singleTransactionMigrator.createTransactions([
			{
				address: profile.wallets().first().address(),
				path: "m/44'/1'/1'/0/0",
			},
		]);

		render(
			<LedgerTransactionSuccessStep
				profile={profile}
				transfer={createTransfer()}
				migrator={singleTransactionMigrator}
				onGoToPortfolio={onGoToPortfolio}
				onGoToNextTransaction={onGoToNextTransaction}
			/>,
			{ route },
		);

		expect(screen.getByTestId("LedgerMigration_success")).toBeInTheDocument();
		expect(screen.getByTestId("LedgerTransactionSuccessStep_goto-portfolio")).toBeInTheDocument();
	});

	it("should render migration complete view for multiple transactions", async () => {
		const onGoToPortfolio = vi.fn();
		const onGoToNextTransaction = vi.fn();

		vi.spyOn(migrator, "isMigrationComplete").mockReturnValue(true);

		render(
			<LedgerTransactionSuccessStep
				profile={profile}
				transfer={createTransfer()}
				migrator={migrator}
				onGoToPortfolio={onGoToPortfolio}
				onGoToNextTransaction={onGoToNextTransaction}
			/>,
			{ route },
		);

		await waitFor(() => {
			expect(screen.getByTestId("MigratedAddressesTable")).toBeInTheDocument();
		});
	});

	it("should render in-progress view for multiple transactions", async () => {
		const onGoToPortfolio = vi.fn();
		const onGoToNextTransaction = vi.fn();

		vi.spyOn(migrator, "isMigrationComplete").mockReturnValue(false);

		const { container } = render(
			<LedgerTransactionSuccessStep
				profile={profile}
				transfer={createTransfer()}
				migrator={migrator}
				onGoToPortfolio={onGoToPortfolio}
				onGoToNextTransaction={onGoToNextTransaction}
			/>,
			{ route },
		);

		expect(container.querySelector(".space-y-4")).toBeInTheDocument();
	});

	it("should trigger auto-navigation after delay for multiple pending transactions", async () => {
		const onGoToPortfolio = vi.fn();
		const onGoToNextTransaction = vi.fn();

		vi.spyOn(migrator, "isMigrationComplete").mockReturnValue(false);

		render(
			<LedgerTransactionSuccessStep
				profile={profile}
				transfer={createTransfer()}
				migrator={migrator}
				onGoToPortfolio={onGoToPortfolio}
				onGoToNextTransaction={onGoToNextTransaction}
			/>,
			{ route },
		);

		await waitFor(
			() => {
				expect(onGoToNextTransaction).toHaveBeenCalled();
			},
			{ timeout: 3000 },
		);
	});
});
