
import { env, getMainsailProfileId, mockNanoSTransport, render, screen } from "@/utils/testing-library";
import { expect, it, describe, beforeEach } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { LedgerMigrator } from "@/app/lib/mainsail/ledger.migrator";
import { createLedgerMocks } from "@/tests/mocks/Ledger";
import { LedgerAddressVerification } from "./LedgerAddressVerification";
import userEvent from "@testing-library/user-event";

describe("LedgerAddressVerification", () => {
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

		render(<LedgerAddressVerification transfer={migrator.transactions().at(0)!} />, { route });
		expect(screen.getByTestId("LedgerAddressVerification")).toBeInTheDocument();

		ledgerMocks.restoreAll();
	});

	it("should fail to verify", async () => {
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

		render(<LedgerAddressVerification transfer={migrator.transactions().at(0)!} />, { route });
		expect(screen.getByTestId("LedgerAddressVerification")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("LedgerAddressVerification__VerifyAddress-button"))

		expect(screen.getByTestId("LedgerAddressVerification__error")).toBeInTheDocument();
		ledgerMocks.restoreAll();
	});

	it("should fail to verify if recipient is not set", async () => {
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

		const transaction = migrator.transactions().at(0)
		const noRecipientMock = vi.spyOn(transaction, "recipient").mockReturnValue(undefined)

		render(<LedgerAddressVerification transfer={migrator.transactions().at(0)!} />, { route });
		expect(screen.getByTestId("LedgerAddressVerification")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("LedgerAddressVerification__VerifyAddress-button"))

		expect(screen.getByTestId("LedgerAddressVerification__error")).toBeInTheDocument();
		ledgerMocks.restoreAll();
	});
});
