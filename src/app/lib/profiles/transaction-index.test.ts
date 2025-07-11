import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { TransactionIndex } from "./transaction-index";
import { IProfile, IReadWriteWallet } from "./contracts.js";
import { env } from "@/utils/testing-library";
import { WalletData, WalletFlag } from "./wallet.enum.js";
import * as TransactionMapper from "./transaction.mapper.js";

let profile: IProfile;
let wallet: IReadWriteWallet;
let transactionIndex: TransactionIndex;

describe("TransactionIndex", () => {
	beforeEach(async () => {
		profile = await env.profiles().create("test profile");
		wallet = await profile.walletFactory().fromAddress({
			address: "0x125b484e51Ad990b5b3140931f3BD8eAee85Db23",
		});
		transactionIndex = new TransactionIndex(wallet);
	});

	afterEach(() => {
		env.profiles().forget(profile.id());
	});

	it("should create transaction index", () => {
		expect(transactionIndex).toBeInstanceOf(TransactionIndex);
	});

	it("should fetch all transactions", async () => {
		const mockTransaction = {
			isReturn: () => false,
			isSent: () => false,
			normalizeData: vi.fn().mockResolvedValue(undefined),
			setMeta: vi.fn(),
		};

		const mockTransactions = {
			getPagination: () => ({ limit: 100, page: 1, pageCount: 1, totalCount: 1 }),
			items: () => [mockTransaction],
		};

		const transactionsSpy = vi.spyOn(wallet.client(), "transactions").mockResolvedValue(mockTransactions as any);

		const result = await transactionIndex.all();

		expect(transactionsSpy).toHaveBeenCalledWith({
			identifiers: [
				{
					method: wallet.data().get(WalletData.ImportMethod),
					type: "address",
					value: wallet.address(),
				},
			],
		});
		expect(result).toBeDefined();
		expect(mockTransaction.setMeta).toHaveBeenCalledWith("address", wallet.address());
		expect(mockTransaction.setMeta).toHaveBeenCalledWith("publicKey", wallet.publicKey());
	});

	it("should fetch sent transactions", async () => {
		const mockTransaction = {
			isReturn: () => false,
			isSent: () => true,
			normalizeData: vi.fn().mockResolvedValue(undefined),
			setMeta: vi.fn(),
		};

		const mockTransactions = {
			getPagination: () => ({ limit: 100, page: 1, pageCount: 1, totalCount: 1 }),
			items: () => [mockTransaction],
		};

		const transactionsSpy = vi.spyOn(wallet.client(), "transactions").mockResolvedValue(mockTransactions as any);

		const result = await transactionIndex.sent();

		expect(transactionsSpy).toHaveBeenCalledWith({
			from: wallet.address(),
		});
		expect(result).toBeDefined();
	});

	it("should fetch received transactions", async () => {
		const mockTransaction = {
			isReturn: () => false,
			isSent: () => false,
			normalizeData: vi.fn().mockResolvedValue(undefined),
			setMeta: vi.fn(),
		};

		const mockTransactions = {
			getPagination: () => ({ limit: 100, page: 1, pageCount: 1, totalCount: 1 }),
			items: () => [mockTransaction],
		};

		const transactionsSpy = vi.spyOn(wallet.client(), "transactions").mockResolvedValue(mockTransactions as any);

		const result = await transactionIndex.received();

		expect(transactionsSpy).toHaveBeenCalledWith({
			to: wallet.address(),
		});
		expect(result).toBeDefined();
	});

	it("should find transaction by id", async () => {
		const mockTransaction = {
			id: "test-hash",
			normalizeData: vi.fn().mockResolvedValue(undefined),
		};

		const transactionSpy = vi.spyOn(wallet.client(), "transaction").mockResolvedValue(mockTransaction as any);

		const result = await transactionIndex.findById("test-hash");

		expect(transactionSpy).toHaveBeenCalledWith("test-hash");
		expect(result).toBeDefined();
	});

	it("should find transactions by ids", async () => {
		const mockTransaction = {
			id: "test-hash",
			normalizeData: vi.fn().mockResolvedValue(undefined),
		};

		const transactionSpy = vi.spyOn(wallet.client(), "transaction").mockResolvedValue(mockTransaction as any);

		const result = await transactionIndex.findByIds(["test-hash-1", "test-hash-2"]);

		expect(transactionSpy).toHaveBeenCalledTimes(2);
		expect(result).toHaveLength(2);
	});

	it("should set wallet status to hot when cold wallet has sent transactions", async () => {
		const coldSpy = vi.spyOn(wallet, "isCold").mockReturnValue(true);
		const dataSpy = vi.spyOn(wallet.data(), "set");

		const mockTransaction = {
			isReturn: () => false,
			isSent: () => true,
			normalizeData: vi.fn().mockResolvedValue(undefined),
			setMeta: vi.fn(),
		};

		const mockTransactions = {
			getPagination: () => ({ limit: 100, page: 1, pageCount: 1, totalCount: 1 }),
			items: () => [mockTransaction],
		};

		vi.spyOn(wallet.client(), "transactions").mockResolvedValue(mockTransactions as any);

		await transactionIndex.all();

		expect(dataSpy).toHaveBeenCalledWith(WalletData.Status, WalletFlag.Hot);

		coldSpy.mockRestore();
		dataSpy.mockRestore();
	});

	it("should set wallet status to hot when cold wallet has return transactions", async () => {
		const coldSpy = vi.spyOn(wallet, "isCold").mockReturnValue(true);
		const dataSpy = vi.spyOn(wallet.data(), "set");

		const mockTransaction = {
			isReturn: () => true,
			isSent: () => false,
			normalizeData: vi.fn().mockResolvedValue(undefined),
			setMeta: vi.fn(),
		};

		const mockTransactions = {
			getPagination: () => ({ limit: 100, page: 1, pageCount: 1, totalCount: 1 }),
			items: () => [mockTransaction],
		};

		vi.spyOn(wallet.client(), "transactions").mockResolvedValue(mockTransactions as any);

		await transactionIndex.all();

		expect(dataSpy).toHaveBeenCalledWith(WalletData.Status, WalletFlag.Hot);

		coldSpy.mockRestore();
		dataSpy.mockRestore();
	});

	it("should not set wallet status to hot when wallet is not cold", async () => {
		const coldSpy = vi.spyOn(wallet, "isCold").mockReturnValue(false);
		const dataSpy = vi.spyOn(wallet.data(), "set");

		const mockTransaction = {
			isReturn: () => false,
			isSent: () => true,
			normalizeData: vi.fn().mockResolvedValue(undefined),
			setMeta: vi.fn(),
		};

		const mockTransactions = {
			getPagination: () => ({ limit: 100, page: 1, pageCount: 1, totalCount: 1 }),
			items: () => [mockTransaction],
		};

		vi.spyOn(wallet.client(), "transactions").mockResolvedValue(mockTransactions as any);

		await transactionIndex.all();

		expect(dataSpy).not.toHaveBeenCalledWith(WalletData.Status, WalletFlag.Hot);

		coldSpy.mockRestore();
		dataSpy.mockRestore();
	});

	it("should not set wallet status to hot when transactions are not sent or return", async () => {
		const coldSpy = vi.spyOn(wallet, "isCold").mockReturnValue(true);
		const dataSpy = vi.spyOn(wallet.data(), "set");

		const mockTransaction = {
			isReturn: () => false,
			isSent: () => false,
			normalizeData: vi.fn().mockResolvedValue(undefined),
			setMeta: vi.fn(),
		};

		const mockTransactions = {
			getPagination: () => ({ limit: 100, page: 1, pageCount: 1, totalCount: 1 }),
			items: () => [mockTransaction],
		};

		vi.spyOn(wallet.client(), "transactions").mockResolvedValue(mockTransactions as any);

		await transactionIndex.all();

		expect(dataSpy).not.toHaveBeenCalledWith(WalletData.Status, WalletFlag.Hot);

		coldSpy.mockRestore();
		dataSpy.mockRestore();
	});

	it("should pass query parameters to all method", async () => {
		const mockTransaction = {
			isReturn: () => false,
			isSent: () => false,
			normalizeData: vi.fn().mockResolvedValue(undefined),
			setMeta: vi.fn(),
		};

		const mockTransactions = {
			getPagination: () => ({ limit: 100, page: 1, pageCount: 1, totalCount: 1 }),
			items: () => [mockTransaction],
		};

		const transactionsSpy = vi.spyOn(wallet.client(), "transactions").mockResolvedValue(mockTransactions as any);

		const queryParams = { limit: 50, page: 2 };
		await transactionIndex.all(queryParams);

		expect(transactionsSpy).toHaveBeenCalledWith({
			identifiers: [
				{
					method: wallet.data().get(WalletData.ImportMethod),
					type: "address",
					value: wallet.address(),
				},
			],
			...queryParams,
		});
	});

	it("should pass query parameters to sent method", async () => {
		const mockTransaction = {
			isReturn: () => false,
			isSent: () => true,
			normalizeData: vi.fn().mockResolvedValue(undefined),
			setMeta: vi.fn(),
		};

		const mockTransactions = {
			getPagination: () => ({ limit: 100, page: 1, pageCount: 1, totalCount: 1 }),
			items: () => [mockTransaction],
		};

		const transactionsSpy = vi.spyOn(wallet.client(), "transactions").mockResolvedValue(mockTransactions as any);

		const queryParams = { limit: 25 };
		await transactionIndex.sent(queryParams);

		expect(transactionsSpy).toHaveBeenCalledWith({
			from: wallet.address(),
			...queryParams,
		});
	});

	it("should pass query parameters to received method", async () => {
		const mockTransaction = {
			isReturn: () => false,
			isSent: () => false,
			normalizeData: vi.fn().mockResolvedValue(undefined),
			setMeta: vi.fn(),
		};

		const mockTransactions = {
			getPagination: () => ({ limit: 100, page: 1, pageCount: 1, totalCount: 1 }),
			items: () => [mockTransaction],
		};

		const transactionsSpy = vi.spyOn(wallet.client(), "transactions").mockResolvedValue(mockTransactions as any);

		const queryParams = { limit: 10 };
		await transactionIndex.received(queryParams);

		expect(transactionsSpy).toHaveBeenCalledWith({
			to: wallet.address(),
			...queryParams,
		});
	});
});
