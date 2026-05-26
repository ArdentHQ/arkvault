import { env, getMainsailProfileId, mockNanoSTransport, render, screen } from "@/utils/testing-library";
import userEvent from "@testing-library/user-event";
import { expect, it, describe, beforeAll, vi } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { LedgerTransactionErrorStep } from "./LedgerTransactionErrorStep";
import { LedgerMigrator } from "@/app/lib/mainsail/ledger.migrator";
import { createLedgerMocks } from "@/tests/mocks/Ledger";

describe("LedgerTransactionErrorStep", () => {
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
		]);
	});

	it("should render the error step", async () => {
		const transfer = profile.draftTransactionFactory().transfer();
		transfer.setSender(profile.wallets().first());
		transfer.addRecipientWallet(profile.wallets().last());
		transfer.setAmount(1);

		render(<LedgerTransactionErrorStep transfer={transfer} migrator={migrator} />, { route });

		expect(screen.getByTestId("LedgerTransactionErrorStep")).toBeInTheDocument();
	});

	it("should show close and try again buttons", async () => {
		const transfer = profile.draftTransactionFactory().transfer();
		transfer.setSender(profile.wallets().first());
		transfer.addRecipientWallet(profile.wallets().last());
		transfer.setAmount(1);

		render(<LedgerTransactionErrorStep transfer={transfer} migrator={migrator} />, { route });

		const buttons = screen.getAllByTestId("LedgerScanStep__continue-button");
		expect(buttons).toHaveLength(2);
	});

	it("should call onClose when close button is clicked", async () => {
		const onClose = vi.fn();

		const transfer = profile.draftTransactionFactory().transfer();
		transfer.setSender(profile.wallets().first());
		transfer.addRecipientWallet(profile.wallets().last());
		transfer.setAmount(1);

		render(<LedgerTransactionErrorStep transfer={transfer} migrator={migrator} onClose={onClose} />, { route });

		const buttons = screen.getAllByTestId("LedgerScanStep__continue-button");
		await userEvent.click(buttons[0]);

		expect(onClose).toHaveBeenCalled();
	});

	it("should call onTryAgain when try again button is clicked", async () => {
		const onTryAgain = vi.fn();

		const transfer = profile.draftTransactionFactory().transfer();
		transfer.setSender(profile.wallets().first());
		transfer.addRecipientWallet(profile.wallets().last());
		transfer.setAmount(1);

		render(<LedgerTransactionErrorStep transfer={transfer} migrator={migrator} onTryAgain={onTryAgain} />, {
			route,
		});

		const buttons = screen.getAllByTestId("LedgerScanStep__continue-button");
		await userEvent.click(buttons[1]);

		expect(onTryAgain).toHaveBeenCalled();
	});
});
