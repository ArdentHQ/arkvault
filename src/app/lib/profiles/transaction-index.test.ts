import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { IProfile, IReadWriteWallet } from "./contracts.js";
import { TransactionIndex } from "./transaction-index";
import * as TransactionMapper from "./transaction.mapper.js";
import { env } from "@/utils/testing-library";
import { WalletData, WalletFlag } from "./wallet.enum.js";

let profile: IProfile;
let wallet: IReadWriteWallet;
let subject: TransactionIndex;
let transactionsSpy: any;
let transactionSpy: any;

const mockTransactionCollection = {
	getPagination: () => ({}),
	items: () => [
		{
			isReturn: () => false,
			isSent: () => false,
			normalizeData: vi.fn().mockResolvedValue(undefined),
			setMeta: vi.fn(),
		},
	],
};

describe("TransactionIndex", () => {
	beforeEach(async () => {
		profile = await env.profiles().create("test profile");
		wallet = await profile.walletFactory().fromAddress({
			address: "d8bc12a67e5b7d60965e3816174a8c325c957827",
		});
		subject = new TransactionIndex(wallet);

		transactionsSpy = vi.fn().mockResolvedValue(mockTransactionCollection);
		transactionSpy = vi.fn().mockResolvedValue({});

		vi.spyOn(wallet, "client").mockReturnValue({
			transaction: transactionSpy,
			transactions: transactionsSpy,
		} as any);

		vi.spyOn(TransactionMapper, "transformConfirmedTransactionDataCollection").mockResolvedValue({} as any);
		vi.spyOn(TransactionMapper, "transformTransactionData").mockReturnValue({} as any);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		env.profiles().forget(profile.id());
	});

	it("should fetch all transactions", async () => {
		await subject.all({ page: 1 });

		expect(transactionsSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				identifiers: expect.any(Array),
				page: 1,
			}),
		);
	});

	it("should fetch sent transactions", async () => {
		await subject.sent({ page: 1 });

		expect(transactionsSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				from: wallet.address(),
				page: 1,
			}),
		);
	});

	it("should fetch received transactions", async () => {
		await subject.received({ page: 1 });

		expect(transactionsSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				page: 1,
				to: wallet.address(),
			}),
		);
	});

	it("should find a transaction by its ID", async () => {
		await expect(subject.findById("id")).resolves.toBeDefined();

		expect(transactionSpy).toHaveBeenCalledWith("id");
	});

	it("should find multiple transactions by their IDs", async () => {
		await expect(subject.findByIds(["id1", "id2"])).resolves.toBeDefined();

		expect(transactionSpy).toHaveBeenCalledTimes(2);
		expect(transactionSpy).toHaveBeenCalledWith("id1");
		expect(transactionSpy).toHaveBeenCalledWith("id2");
	});

	it("should flag a cold wallet as hot if it sends a transaction", async () => {
		const dataSetSpy = vi.spyOn(wallet.data(), "set");
		vi.spyOn(wallet, "isCold").mockReturnValue(true);
		const itemsSpy = vi.spyOn(mockTransactionCollection, "items").mockReturnValue([
			{
				isReturn: () => false,
				isSent: () => true,
				normalizeData: vi.fn(),
				setMeta: vi.fn(),
			},
		] as any);

		await subject.all();

		expect(dataSetSpy).toHaveBeenCalledWith(WalletData.Status, WalletFlag.Hot);

		itemsSpy.mockRestore();
	});

	it("should flag a cold wallet as hot if it has a return transaction", async () => {
		const dataSetSpy = vi.spyOn(wallet.data(), "set");
		vi.spyOn(wallet, "isCold").mockReturnValue(true);
		const itemsSpy = vi.spyOn(mockTransactionCollection, "items").mockReturnValue([
			{
				isReturn: () => true,
				isSent: () => false,
				normalizeData: vi.fn(),
				setMeta: vi.fn(),
			},
		] as any);

		await subject.all();

		expect(dataSetSpy).toHaveBeenCalledWith(WalletData.Status, WalletFlag.Hot);

		itemsSpy.mockRestore();
	});

	it("should not flag a cold wallet as hot if it only has received transactions", async () => {
		const dataSetSpy = vi.spyOn(wallet.data(), "set");
		vi.spyOn(wallet, "isCold").mockReturnValue(true);

		// eslint-disable-next-line testing-library/await-async-query
		await subject.all();

		expect(dataSetSpy).not.toHaveBeenCalled();
	});
});
