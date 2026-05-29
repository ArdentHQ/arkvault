import { env, getMainsailProfileId, mockNanoSTransport, render, screen } from "@/utils/testing-library";
import { expect, it, describe, beforeEach, vi } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { LedgerMigrator } from "@/app/lib/mainsail/ledger.migrator";
import { createLedgerMocks } from "@/tests/mocks/Ledger";
import { LedgerAddressVerification } from "./LedgerAddressVerification";
import userEvent from "@testing-library/user-event";
import { MessageService } from "@/app/lib/mainsail/message.service";

describe("LedgerAddressVerification", () => {
	const verifyAddressButtonTestId = "LedgerAddressVerification__VerifyAddress-button";
	const testPath = "m/44'/1'/1'/0/0";

	let profile: Contracts.IProfile;
	const route = `/profiles/${getMainsailProfileId()}/dashboard`;
	let publicKeyPaths;

	beforeEach(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		await env.profiles().restore(profile);
		publicKeyPaths = new Map([[testPath, profile.wallets().first().publicKey()!]]);
	});

	it("should render", async () => {
		mockNanoSTransport();
		const migrator = new LedgerMigrator({ env, profile: env.profiles().first() });

		const ledgerMocks = createLedgerMocks(profile.wallets().first(), publicKeyPaths);

		await migrator.createTransactions([
			{
				address: profile.wallets().first().address(),
				path: testPath,
			},
		]);

		render(<LedgerAddressVerification transfer={migrator.transactions().at(0)!} />, { route });
		expect(screen.getByTestId("LedgerAddressVerification")).toBeInTheDocument();

		ledgerMocks.restoreAll();
	});

	it("should fail to verify", async () => {
		mockNanoSTransport();
		const migrator = new LedgerMigrator({ env, profile: env.profiles().first() });

		const ledgerMocks = createLedgerMocks(profile.wallets().first(), publicKeyPaths);

		await migrator.createTransactions([
			{
				address: profile.wallets().first().address(),
				path: testPath,
			},
		]);

		render(<LedgerAddressVerification transfer={migrator.transactions().at(0)!} />, { route });
		expect(screen.getByTestId("LedgerAddressVerification")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId(verifyAddressButtonTestId));

		expect(screen.getByTestId("LedgerAddressVerification__error")).toBeInTheDocument();
		ledgerMocks.restoreAll();
	});

	it("should fail to verify if recipient is not set", async () => {
		mockNanoSTransport();
		const migrator = new LedgerMigrator({ env, profile: env.profiles().first() });

		const ledgerMocks = createLedgerMocks(profile.wallets().first(), publicKeyPaths);

		await migrator.createTransactions([
			{
				address: profile.wallets().first().address(),
				path: testPath,
			},
		]);

		const transaction = migrator.transactions().at(0);
		const noRecipientMock = vi.spyOn(transaction, "recipient").mockReturnValue(undefined);

		render(<LedgerAddressVerification transfer={migrator.transactions().at(0)!} />, { route });
		expect(screen.getByTestId("LedgerAddressVerification")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId(verifyAddressButtonTestId));

		expect(screen.getByTestId("LedgerAddressVerification__error")).toBeInTheDocument();
		ledgerMocks.restoreAll();
		noRecipientMock.mockRestore();
	});

	it("should verify successfully", async () => {
		mockNanoSTransport();
		const migrator = new LedgerMigrator({ env, profile: env.profiles().first() });

		const ledgerMocks = createLedgerMocks(profile.wallets().first(), publicKeyPaths);

		await migrator.createTransactions([
			{
				address: profile.wallets().first().address(),
				path: testPath,
			},
		]);

		const signMessageSpy = vi
			.spyOn(profile.wallets().first().ledger(), "signMessage")
			.mockResolvedValue("signature");

		vi.spyOn(MessageService.prototype, "verify").mockReturnValue(true);

		render(<LedgerAddressVerification transfer={migrator.transactions().at(0)!} />, { route });
		expect(screen.getByTestId("LedgerAddressVerification")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId(verifyAddressButtonTestId));

		expect(screen.getByText("Message and Address Verified Successfully")).toBeInTheDocument();
		ledgerMocks.restoreAll();
		signMessageSpy.mockRestore();
	});

	it("should cancel verification", async () => {
		mockNanoSTransport();
		const migrator = new LedgerMigrator({ env, profile: env.profiles().first() });

		const ledgerMocks = createLedgerMocks(profile.wallets().first(), publicKeyPaths);

		await migrator.createTransactions([
			{
				address: profile.wallets().first().address(),
				path: testPath,
			},
		]);

		let signResolve: () => void;
		const signMessageSpy = vi.spyOn(profile.wallets().first().ledger(), "signMessage").mockImplementation(
			() =>
				new Promise<string>((resolve) => {
					signResolve = resolve;
				}),
		);

		render(<LedgerAddressVerification transfer={migrator.transactions().at(0)!} />, { route });
		expect(screen.getByTestId("LedgerAddressVerification")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId(verifyAddressButtonTestId));

		await userEvent.click(screen.getByText("Cancel"));

		expect(screen.getByTestId("LedgerAddressVerification__error")).toBeInTheDocument();
		signResolve?.();
		ledgerMocks.restoreAll();
		signMessageSpy.mockRestore();
	});

	it("should show error when verification fails after successful signing", async () => {
		mockNanoSTransport();
		const migrator = new LedgerMigrator({ env, profile: env.profiles().first() });

		const ledgerMocks = createLedgerMocks(profile.wallets().first(), publicKeyPaths);

		await migrator.createTransactions([
			{
				address: profile.wallets().first().address(),
				path: testPath,
			},
		]);

		const signMessageSpy = vi
			.spyOn(profile.wallets().first().ledger(), "signMessage")
			.mockResolvedValue("signature");

		vi.spyOn(MessageService.prototype, "verify").mockReturnValue(false);

		render(<LedgerAddressVerification transfer={migrator.transactions().at(0)!} />, { route });
		expect(screen.getByTestId("LedgerAddressVerification")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId(verifyAddressButtonTestId));

		expect(screen.getByTestId("LedgerAddressVerification__error")).toBeInTheDocument();
		ledgerMocks.restoreAll();
		signMessageSpy.mockRestore();
	});
});
