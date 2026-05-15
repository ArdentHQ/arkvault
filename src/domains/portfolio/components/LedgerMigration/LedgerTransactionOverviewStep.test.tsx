import { env, getMainsailProfileId, mockNanoSTransport, render, screen, waitFor, act } from "@/utils/testing-library";
import { expect, it, describe, beforeAll, vi } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { OverviewStep } from "./LedgerTransactionOverviewStep";
import { LedgerMigrator } from "@/app/lib/mainsail/ledger.migrator";
import { createLedgerMocks } from "@/tests/mocks/Ledger";
import { ExtendedSignedTransactionData } from "@/app/lib/profiles/signed-transaction.dto";

vi.mock("@/domains/transaction/components/TransactionSuccessful/hooks/useConfirmedTransaction", () => ({
	useConfirmedTransaction: vi.fn().mockReturnValue({
		isConfirmed: true,
		transaction: undefined,
	}),
}));

describe("LedgerTransactionOverviewStep", () => {
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

	it("should render overview step", async () => {
		const onContinue = vi.fn();
		const onVerifyAddress = vi.fn();

		await act(async () => {
			render(
				<OverviewStep
					profile={profile}
					transfer={createTransfer()}
					migrator={migrator}
					onContinue={onContinue}
					onVerifyAddress={onVerifyAddress}
				/>,
				{ route },
			);
		});

		expect(screen.getByTestId("Overview_accept-responsibility")).toBeInTheDocument();
		expect(screen.getByTestId("OverviewStep__continue-button")).toBeInTheDocument();
	});

	it("should not call onContinue when checkbox is unchecked", async () => {
		const onContinue = vi.fn();
		const onVerifyAddress = vi.fn();

		await act(async () => {
			render(
				<OverviewStep
					profile={profile}
					transfer={createTransfer()}
					migrator={migrator}
					onContinue={onContinue}
					onVerifyAddress={onVerifyAddress}
				/>,
				{ route },
			);
		});

		expect(screen.getByTestId("OverviewStep__continue-button")).toBeDisabled();
	});

	it("should not show Transactions component when only one transaction", async () => {
		const singleMigrator = new LedgerMigrator({ env, profile: env.profiles().first() });

		await singleMigrator.createTransactions([
			{
				address: profile.wallets().first().address(),
				path: "m/44'/1'/1'/0/0",
			},
		]);

		const onContinue = vi.fn();
		const onVerifyAddress = vi.fn();

		await act(async () => {
			render(
				<OverviewStep
					profile={profile}
					transfer={createTransfer()}
					migrator={singleMigrator}
					onContinue={onContinue}
					onVerifyAddress={onVerifyAddress}
				/>,
				{ route },
			);
		});

		expect(screen.queryByTestId("LedgerMigration__Transactions")).not.toBeInTheDocument();
		await waitFor(() => {
			expect(screen.getByTestId("Overview_accept-responsibility")).toBeInTheDocument();
		});
	});
});
