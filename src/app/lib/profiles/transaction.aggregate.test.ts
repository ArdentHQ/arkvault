import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { IProfile, IReadWriteWallet } from "./contracts.js";
import { TransactionAggregate } from "./transaction.aggregate";
import { env, MAINSAIL_MNEMONICS } from "@/utils/testing-library";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { ExtendedConfirmedTransactionData } from "./transaction.dto.js";
import { ExtendedConfirmedTransactionDataCollection } from "./transaction.collection";

let profile: IProfile;
let wallet: IReadWriteWallet;
let wallet2: IReadWriteWallet;
let subject: TransactionAggregate;

const createTransactionMock = (wallet: IReadWriteWallet) =>
	new ExtendedConfirmedTransactionData(wallet, {
		...TransactionFixture,
		wallet: () => wallet,
	} as any);

describe("TransactionAggregate", () => {
	beforeEach(async () => {
		profile = await env.profiles().create("test profile");

		wallet = await profile.walletFactory().fromMnemonicWithBIP39({ mnemonic: MAINSAIL_MNEMONICS[0] });
		wallet2 = await profile.walletFactory().fromMnemonicWithBIP39({ mnemonic: MAINSAIL_MNEMONICS[1] });

		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet2, "hasSyncedWithNetwork").mockReturnValue(true);

		profile.wallets().push(wallet);
		profile.wallets().push(wallet2);

		subject = new TransactionAggregate(profile);
	});

	afterEach(() => {
		env.profiles().forget(profile.id());
		vi.restoreAllMocks();
	});

	const pagination = { last: undefined, next: 2, prev: undefined, self: undefined };

	it("should return an empty collection if there are no wallets", async () => {
		profile.wallets().flush();
		const result = await subject.all();
		expect(result).toBeInstanceOf(Object);
		expect(result.items()).toHaveLength(0);
	});

	it("should aggregate all transactions", async () => {
		const allSpy = vi
			.spyOn(wallet.transactionIndex(), "all")
			.mockResolvedValue(
				new ExtendedConfirmedTransactionDataCollection([createTransactionMock(wallet)], pagination),
			);

		const result = await subject.all();
		expect(allSpy).toHaveBeenCalled();
		expect(result.items()).toHaveLength(1);
	});

	it("should aggregate sent transactions", async () => {
		const sentSpy = vi
			.spyOn(wallet.transactionIndex(), "sent")
			.mockResolvedValue(
				new ExtendedConfirmedTransactionDataCollection([createTransactionMock(wallet)], pagination),
			);

		const result = await subject.sent();
		expect(sentSpy).toHaveBeenCalled();
		expect(result.items()).toHaveLength(1);
	});

	it("should aggregate received transactions", async () => {
		const receivedSpy = vi
			.spyOn(wallet.transactionIndex(), "received")
			.mockResolvedValue(
				new ExtendedConfirmedTransactionDataCollection([createTransactionMock(wallet)], pagination),
			);

		const result = await subject.received();
		expect(receivedSpy).toHaveBeenCalled();
		expect(result.items()).toHaveLength(1);
	});

	it("should check if there are more pages", async () => {
		const collection = new ExtendedConfirmedTransactionDataCollection([createTransactionMock(wallet)], { next: 2 });
		const allSpy = vi.spyOn(wallet, "transactionIndex").mockImplementation(
			() =>
				({
					all: vi.fn().mockResolvedValue(collection),
				}) as any,
		);

		await subject.all();

		expect(subject.hasMore("all")).toBe(true);
		allSpy.mockRestore();
	});

	it("should flush history", async () => {
		const collection = new ExtendedConfirmedTransactionDataCollection([createTransactionMock(wallet)], { next: 2 });
		const allSpy = vi.spyOn(wallet.transactionIndex(), "all").mockResolvedValue(collection);

		await subject.all();
		expect(subject.hasMore("all")).toBe(true);

		subject.flush("all");
		expect(subject.hasMore("all")).toBe(false);

		subject.flush();
		expect(subject.hasMore("all")).toBe(false);
		allSpy.mockRestore();
	});

	it("should handle transaction index errors gracefully", async () => {
		vi.spyOn(wallet.transactionIndex(), "all").mockRejectedValue(new Error("test error"));
		const result = await subject.all();
		expect(result).toBeInstanceOf(Object);
		expect(result.items()).toHaveLength(0);
	});

	it("should filter wallets by identifiers", async () => {
		const allSpy = vi
			.spyOn(wallet.transactionIndex(), "all")
			.mockResolvedValue(new ExtendedConfirmedTransactionDataCollection([], { ...pagination, next: undefined }));

		await subject.all({ identifiers: [{ type: "address", value: wallet.address() }] });
		expect(allSpy).toHaveBeenCalled();
	});

	it("should filter wallets by extended public key", async () => {
		const allSpy = vi
			.spyOn(wallet.transactionIndex(), "all")
			.mockResolvedValue(new ExtendedConfirmedTransactionDataCollection([], { ...pagination, next: undefined }));
		vi.spyOn(wallet, "publicKey").mockReturnValue("test-pk");

		await subject.all({ identifiers: [{ type: "extendedPublicKey", value: "test-pk" }] });
		expect(allSpy).toHaveBeenCalled();
	});

	it("should use history for subsequent calls", async () => {
		const collectionWithMore = new ExtendedConfirmedTransactionDataCollection([createTransactionMock(wallet)], {
			next: 2,
		});
		const collectionWithoutMore = new ExtendedConfirmedTransactionDataCollection(
			[createTransactionMock(wallet)],
			{},
		);

		const allSpy = vi
			.spyOn(wallet.transactionIndex(), "all")
			.mockResolvedValueOnce(collectionWithMore)
			.mockResolvedValueOnce(collectionWithoutMore);

		await subject.all();
		await subject.all();

		expect(allSpy).toHaveBeenCalledTimes(2);
		expect(allSpy).toHaveBeenLastCalledWith({ cursor: 2 });
	});

	it("should create a history key with types", async () => {
		const allSpy = vi
			.spyOn(wallet.transactionIndex(), "all")
			.mockResolvedValue(new ExtendedConfirmedTransactionDataCollection([], { ...pagination, next: undefined }));

		await subject.all({ types: ["type1", "type2"] });
		expect(allSpy).toHaveBeenCalled();
	});

	it("should filter wallets by from address", async () => {
		const allSpy = vi
			.spyOn(wallet.transactionIndex(), "all")
			.mockResolvedValue(new ExtendedConfirmedTransactionDataCollection([], { ...pagination, next: undefined }));

		await subject.all({ from: wallet.address() });
		expect(allSpy).toHaveBeenCalled();
	});
});
