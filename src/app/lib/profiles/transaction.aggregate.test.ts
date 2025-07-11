import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { IProfile, IReadWriteWallet } from "./contracts.js";
import { TransactionAggregate } from "./transaction.aggregate";
import { env, MAINSAIL_MNEMONICS } from "@/utils/testing-library";
import { ExtendedConfirmedTransactionDataCollection } from "./transaction.collection";

let profile: IProfile;
let wallet: IReadWriteWallet;
let wallet2: IReadWriteWallet;
let subject: TransactionAggregate;

const createTransactionMock = (wallet: IReadWriteWallet) => ({
	id: "id",
	wallet: () => wallet,
});

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

	it("should return an empty collection if there are no wallets", async () => {
		profile.wallets().flush();
		const result = await subject.all();
		expect(result).toBeInstanceOf(ExtendedConfirmedTransactionDataCollection);
		expect(result.items()).toHaveLength(0);
	});

	it("should aggregate all transactions", async () => {
		const allSpy = vi
			.spyOn(wallet.transactionIndex(), "all")
			.mockResolvedValue(
				new ExtendedConfirmedTransactionDataCollection([createTransactionMock(wallet)], { nextPage: 2 }),
			);

		const result = await subject.all();
		expect(allSpy).toHaveBeenCalled();
		expect(result.items()).toHaveLength(1);
	});

	it("should aggregate sent transactions", async () => {
		const sentSpy = vi
			.spyOn(wallet.transactionIndex(), "sent")
			.mockResolvedValue(
				new ExtendedConfirmedTransactionDataCollection([createTransactionMock(wallet)], { nextPage: 2 }),
			);

		const result = await subject.sent();
		expect(sentSpy).toHaveBeenCalled();
		expect(result.items()).toHaveLength(1);
	});

	it("should aggregate received transactions", async () => {
		const receivedSpy = vi
			.spyOn(wallet.transactionIndex(), "received")
			.mockResolvedValue(
				new ExtendedConfirmedTransactionDataCollection([createTransactionMock(wallet)], { nextPage: 2 }),
			);

		const result = await subject.received();
		expect(receivedSpy).toHaveBeenCalled();
		expect(result.items()).toHaveLength(1);
	});

	it("should check if there are more pages", async () => {
		vi.spyOn(wallet.transactionIndex(), "all").mockResolvedValue(
			new ExtendedConfirmedTransactionDataCollection([createTransactionMock(wallet)], { nextPage: 2 }),
		);

		await subject.all();
		expect(subject.hasMore("all")).toBe(true);
	});

	it("should flush history", async () => {
		vi.spyOn(wallet.transactionIndex(), "all").mockResolvedValue(
			new ExtendedConfirmedTransactionDataCollection([createTransactionMock(wallet)], { nextPage: 2 }),
		);

		await subject.all();
		expect(subject.hasMore("all")).toBe(true);

		subject.flush("all");
		expect(subject.hasMore("all")).toBe(false);

		subject.flush();
		expect(subject.hasMore("all")).toBe(false);
	});

	it("should handle transaction index errors gracefully", async () => {
		vi.spyOn(wallet.transactionIndex(), "all").mockRejectedValue(new Error("test error"));
		const result = await subject.all();
		expect(result).toBeInstanceOf(ExtendedConfirmedTransactionDataCollection);
		expect(result.items()).toHaveLength(0);
	});

	it("should filter wallets by identifiers", async () => {
		const allSpy = vi
			.spyOn(wallet.transactionIndex(), "all")
			.mockResolvedValue(new ExtendedConfirmedTransactionDataCollection([], {}));

		await subject.all({ identifiers: [{ type: "address", value: wallet.address() }] });
		expect(allSpy).toHaveBeenCalled();
	});

	it("should filter wallets by extended public key", async () => {
		const allSpy = vi
			.spyOn(wallet.transactionIndex(), "all")
			.mockResolvedValue(new ExtendedConfirmedTransactionDataCollection([], {}));
		vi.spyOn(wallet, "publicKey").mockReturnValue("test-pk");

		await subject.all({ identifiers: [{ type: "extendedPublicKey", value: "test-pk" }] });
		expect(allSpy).toHaveBeenCalled();
	});

	it("should use history for subsequent calls", async () => {
		const allSpy = vi
			.spyOn(wallet.transactionIndex(), "all")
			.mockResolvedValue(
				new ExtendedConfirmedTransactionDataCollection([createTransactionMock(wallet)], { nextPage: 2 }),
			);

		await subject.all();
		await subject.all();

		expect(allSpy).toHaveBeenCalledTimes(2);
		expect(allSpy).toHaveBeenLastCalledWith(expect.objectContaining({ cursor: 2 }));
	});

	it("should create a history key with types", async () => {
		const allSpy = vi
			.spyOn(wallet.transactionIndex(), "all")
			.mockResolvedValue(new ExtendedConfirmedTransactionDataCollection([], {}));

		await subject.all({ types: ["type1", "type2"] });
		expect(allSpy).toHaveBeenCalled();
	});

	it("should filter wallets by from address", async () => {
		const allSpy = vi
			.spyOn(wallet.transactionIndex(), "all")
			.mockResolvedValue(new ExtendedConfirmedTransactionDataCollection([], {}));

		await subject.all({ from: wallet.address() });
		expect(allSpy).toHaveBeenCalled();
	});
});
