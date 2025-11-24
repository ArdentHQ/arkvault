import { env, getMainsailProfileId, mockNanoSTransport, MAINSAIL_MNEMONICS } from "@/utils/testing-library";
import { expect, it, describe, beforeEach, vi } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { minVersionList } from "@/app/contexts";
import { WalletData } from "@/app/lib/mainsail/wallet.dto";
import { BigNumber } from "@/app/lib/helpers";
import { LedgerMigrator } from "@/app/lib/mainsail/ledger.migrator";

export const createLedgerMocks = (wallet: Contracts.IReadWriteWallet, publicKeyPaths: Map<string, string>) => {
	const isEthBasedAppSpy = vi.spyOn(wallet.ledger(), "isEthBasedApp").mockResolvedValue(true);
	const versionSpy = vi
		.spyOn(wallet.ledger(), "getVersion")
		.mockResolvedValue(minVersionList[wallet.network().coin()]);
	const publicKeySpy = vi
		.spyOn(wallet.ledger(), "getPublicKey")
		.mockResolvedValue(publicKeyPaths.values().next().value!);
	const scanSpy = vi.spyOn(wallet.ledger(), "scan").mockResolvedValue({
		"m/44'/1'/1'/0/0": new WalletData({ config: wallet.network().config() }).fill({
			address: wallet.address(),
			balance: 10,
			publicKey: wallet.publicKey(),
		}),
	});
	const extendedPublicKeySpy = vi
		.spyOn(wallet.ledger(), "getExtendedPublicKey")
		.mockResolvedValue(wallet.publicKey()!);

	return {
		restoreAll: () => {
			isEthBasedAppSpy.mockRestore();
			versionSpy.mockRestore();
			publicKeySpy.mockRestore();
			scanSpy.mockRestore();
			extendedPublicKeySpy.mockRestore();
		},
	};
};

const createTransactionMocks = async (wallet: Contracts.IReadWriteWallet) => {
	const signatory = await wallet.signatoryFactory().fromSigningKeys({ key: MAINSAIL_MNEMONICS[0] });
	const hash = await wallet.transaction().signTransfer({
		data: {
			amount: 1,
			to: wallet.profile().wallets().last().address(),
		},
		gasLimit: BigNumber.make(1),
		gasPrice: BigNumber.make(1),
		nonce: BigNumber.make(1).toString(),
		signatory,
	});

	const signatorySpy = vi.spyOn(wallet.signatoryFactory(), "fromSigningKeys").mockResolvedValue(signatory);
	const signSpy = vi.spyOn(wallet.transaction(), "signTransfer").mockResolvedValue(hash);
	const broadcastSpy = vi
		.spyOn(wallet.transaction(), "broadcast")
		.mockResolvedValue({ accepted: [hash], errors: [] });

	return {
		restoreAll: () => {
			signatorySpy.mockRestore();
			signSpy.mockRestore();
			broadcastSpy.mockRestore();
		},
	};
};

describe("LedgerMigrator", () => {
	let profile: Contracts.IProfile;
	let publicKeyPaths: Map<string, string>;
	let ledgerMocks: ReturnType<typeof createLedgerMocks>;
	const senderPath = "m/44'/1'/1'/0/0";
	const recipientPath = "m/44'/66'/1'/0/0";

	beforeEach(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		await env.profiles().restore(profile);

		publicKeyPaths = new Map([
			[senderPath, profile.wallets().first().publicKey()!],
			[recipientPath, profile.wallets().last().publicKey()!],
		]);

		ledgerMocks = createLedgerMocks(profile.wallets().first(), publicKeyPaths);
	});

	afterEach(() => {
		ledgerMocks?.restoreAll();
	});

	it("should create migration transaction", async () => {
		mockNanoSTransport();
		const wallet = profile.wallets().first();
		const migrator = new LedgerMigrator({ env, profile });

		const transaction = await migrator.createTransaction(wallet.address(), senderPath, recipientPath);

		expect(transaction.sender().address()).toBe(wallet.address());
		expect(transaction.recipient()?.address()).toBe(wallet.address());
	});

	it("should calculate fee", async () => {
		mockNanoSTransport();
		const wallet = profile.wallets().first();
		const migrator = new LedgerMigrator({ env, profile });

		const transaction = await migrator.createTransaction(wallet.address(), senderPath, recipientPath);

		expect(transaction.sender().address()).toBe(wallet.address());
		await transaction.calculateFees();

		expect(transaction.gasLimit()?.toString()).toBe("25200");

		transaction.selectFee("avg");
		expect(transaction.selectedFee()?.toString()).toBe("5.06670125");
	});

	it("should set the full amount", async () => {
		mockNanoSTransport();
		const wallet = profile.wallets().first();
		const migrator = new LedgerMigrator({ env, profile });

		const transaction = await migrator.createTransaction(wallet.address(), senderPath, recipientPath);

		expect(transaction.sender().address()).toBe(wallet.address());
		await transaction.calculateFees();

		expect(transaction.gasLimit()?.toString()).toBe("25200");

		transaction.selectFee("avg");
		expect(transaction.selectedFee()?.toString()).toBe("5.06670125");

		transaction.setSenderMaxAmount();

		expect(transaction.amount().toFixed(1)).toBe(wallet.balance().toFixed(1));
	});

	it("should create multiple transactions", async () => {
		mockNanoSTransport();
		const wallet = profile.wallets().first();
		const migrator = new LedgerMigrator({ env, profile });

		await migrator.createTransactions([
			{
				address: wallet.address(),
				path: senderPath,
			},
			{
				address: profile.wallets().last().address(),
				path: recipientPath,
			},
		]);

		expect(migrator.transactions().length).toBe(2);
		expect(migrator.transactions().at(0)?.sender().address()).toBe(wallet.address());
		expect(migrator.transactions().at(1)?.sender().address()).toBe(profile.wallets().last().address());
	});

	it("should iterate on transactions", async () => {
		mockNanoSTransport();
		const wallet = profile.wallets().first();
		const migrator = new LedgerMigrator({ env, profile });

		await migrator.createTransactions([
			{
				address: wallet.address(),
				path: senderPath,
			},
			{
				address: profile.wallets().last().address(),
				path: recipientPath,
			},
		]);

		expect(migrator.transactions().length).toBe(2);
		expect(migrator.transactions().at(0)?.sender().address()).toBe(wallet.address());
		expect(migrator.transactions().at(1)?.sender().address()).toBe(profile.wallets().last().address());

		migrator.nextTransaction();
		expect(migrator.currentTransaction()).toEqual(migrator.transactions().at(0));

		migrator.nextTransaction();
		expect(migrator.currentTransaction()).toEqual(migrator.transactions().at(1));
	});

	it("should run and complete migration for multiple wallets", async () => {
		mockNanoSTransport();
		const wallet = profile.wallets().first();
		const migrator = new LedgerMigrator({ env, profile });
		const transactionSpy1 = await createTransactionMocks(wallet);
		const transactionSpy2 = await createTransactionMocks(profile.wallets().last());

		await migrator.createTransactions([
			{
				address: wallet.address(),
				path: senderPath,
			},
			{
				address: profile.wallets().last().address(),
				path: recipientPath,
			},
		]);

		expect(migrator.transactions().length).toBe(2);
		expect(migrator.transactions().at(0)?.sender().address()).toBe(wallet.address());
		expect(migrator.transactions().at(1)?.sender().address()).toBe(profile.wallets().last().address());

		migrator.nextTransaction();
		expect(migrator.currentTransaction()).toEqual(migrator.transactions().at(0));

		const currentTransaction = migrator.currentTransaction();

		expect(currentTransaction).toEqual(migrator.transactions().at(1));

		await currentTransaction?.calculateFees();
		currentTransaction?.selectFee("avg");

		currentTransaction?.setSenderMaxAmount();
		currentTransaction?.setIsPending(true);

		await currentTransaction?.signAndBroadcast();
		currentTransaction?.setIsCompleted(true);

		expect(migrator.completedTransactions().length).toBe(1);

		const nextTransaction = migrator.nextTransaction();

		expect(migrator.currentTransaction()).toEqual(migrator.transactions().at(1));

		expect(nextTransaction).toEqual(migrator.transactions().at(1));

		await nextTransaction?.calculateFees();
		nextTransaction?.selectFee("avg");

		nextTransaction?.setSenderMaxAmount();
		nextTransaction?.setIsPending(true);

		await nextTransaction?.signAndBroadcast();
		nextTransaction?.setIsCompleted(true);

		expect(migrator.completedTransactions().length).toBe(2);

		expect(migrator.isMigrationComplete()).toBe(true);

		transactionSpy1.restoreAll();
		transactionSpy2.restoreAll();
	});

	it("should flush", async () => {
		mockNanoSTransport();
		const wallet = profile.wallets().first();
		const migrator = new LedgerMigrator({ env, profile });
		const transactionSpy1 = await createTransactionMocks(wallet);
		const transactionSpy2 = await createTransactionMocks(profile.wallets().last());

		await migrator.createTransactions([
			{
				address: wallet.address(),
				path: senderPath,
			},
			{
				address: profile.wallets().last().address(),
				path: recipientPath,
			},
		]);

		expect(migrator.transactions().length).toBe(2);
		expect(migrator.transactions().at(0)?.sender().address()).toBe(wallet.address());
		expect(migrator.transactions().at(1)?.sender().address()).toBe(profile.wallets().last().address());

		migrator.flush();
		expect(migrator.transactions().length).toBe(0);

		transactionSpy1.restoreAll();
		transactionSpy2.restoreAll();
	});
});
