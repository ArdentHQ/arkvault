import { describe, expect, it, vi } from "vitest";

import { TransactionIndex } from "./transaction-index";
import { createWalletMock } from "./wallet.test.helpers";

describe("TransactionIndex", () => {
	it("should create transaction index", () => {
		const wallet = createWalletMock();
		const transactionIndex = new TransactionIndex(wallet);

		expect(transactionIndex).toBeInstanceOf(TransactionIndex);
	});

	it("should fetch all transactions", async () => {
		const wallet = createWalletMock();
		const transactionIndex = new TransactionIndex(wallet);

		const mockTransactions = {
			items: () => [
				{
					isReturn: () => false,
					isSent: () => false,
					setMeta: vi.fn(),
				},
			],
		};

		vi.spyOn(wallet.client(), "transactions").mockResolvedValue(mockTransactions as any);

		const result = await transactionIndex.all();

		expect(wallet.client().transactions).toHaveBeenCalledWith({
			identifiers: [
				{
					method: wallet.data().get("IMPORT_METHOD"),
					type: "address",
					value: wallet.address(),
				},
			],
		});
		expect(result).toBeDefined();
	});

	it("should fetch sent transactions", async () => {
		const wallet = createWalletMock();
		const transactionIndex = new TransactionIndex(wallet);

		const mockTransactions = {
			items: () => [
				{
					isReturn: () => false,
					isSent: () => true,
					setMeta: vi.fn(),
				},
			],
		};

		vi.spyOn(wallet.client(), "transactions").mockResolvedValue(mockTransactions as any);

		const result = await transactionIndex.sent();

		expect(wallet.client().transactions).toHaveBeenCalledWith({
			from: wallet.address(),
		});
		expect(result).toBeDefined();
	});

	it("should fetch received transactions", async () => {
		const wallet = createWalletMock();
		const transactionIndex = new TransactionIndex(wallet);

		const mockTransactions = {
			items: () => [
				{
					isReturn: () => false,
					isSent: () => false,
					setMeta: vi.fn(),
				},
			],
		};

		vi.spyOn(wallet.client(), "transactions").mockResolvedValue(mockTransactions as any);

		const result = await transactionIndex.received();

		expect(wallet.client().transactions).toHaveBeenCalledWith({
			to: wallet.address(),
		});
		expect(result).toBeDefined();
	});

	it("should find transaction by id", async () => {
		const wallet = createWalletMock();
		const transactionIndex = new TransactionIndex(wallet);

		const mockTransaction = {
			id: "test-hash",
		};

		vi.spyOn(wallet.client(), "transaction").mockResolvedValue(mockTransaction as any);

		const result = await transactionIndex.findById("test-hash");

		expect(wallet.client().transaction).toHaveBeenCalledWith("test-hash");
		expect(result).toBeDefined();
	});

	it("should find transactions by ids", async () => {
		const wallet = createWalletMock();
		const transactionIndex = new TransactionIndex(wallet);

		const mockTransaction = {
			id: "test-hash",
		};

		vi.spyOn(wallet.client(), "transaction").mockResolvedValue(mockTransaction as any);

		const result = await transactionIndex.findByIds(["test-hash-1", "test-hash-2"]);

		expect(wallet.client().transaction).toHaveBeenCalledTimes(2);
		expect(result).toHaveLength(2);
	});

	it("should set wallet status to hot when cold wallet has sent transactions", async () => {
		const wallet = createWalletMock();
		const transactionIndex = new TransactionIndex(wallet);

		vi.spyOn(wallet, "isCold").mockReturnValue(true);

		const mockTransactions = {
			items: () => [
				{
					isReturn: () => false,
					isSent: () => true,
					setMeta: vi.fn(),
				},
			],
		};

		vi.spyOn(wallet.client(), "transactions").mockResolvedValue(mockTransactions as any);

		await transactionIndex.all();

		expect(wallet.data().set).toHaveBeenCalledWith("STATUS", "HOT");
	});

	it("should set wallet status to hot when cold wallet has return transactions", async () => {
		const wallet = createWalletMock();
		const transactionIndex = new TransactionIndex(wallet);

		vi.spyOn(wallet, "isCold").mockReturnValue(true);

		const mockTransactions = {
			items: () => [
				{
					isReturn: () => true,
					isSent: () => false,
					setMeta: vi.fn(),
				},
			],
		};

		vi.spyOn(wallet.client(), "transactions").mockResolvedValue(mockTransactions as any);

		await transactionIndex.all();

		expect(wallet.data().set).toHaveBeenCalledWith("STATUS", "HOT");
	});

	it("should not set wallet status to hot when wallet is not cold", async () => {
		const wallet = createWalletMock();
		const transactionIndex = new TransactionIndex(wallet);

		vi.spyOn(wallet, "isCold").mockReturnValue(false);

		const mockTransactions = {
			items: () => [
				{
					isReturn: () => false,
					isSent: () => true,
					setMeta: vi.fn(),
				},
			],
		};

		vi.spyOn(wallet.client(), "transactions").mockResolvedValue(mockTransactions as any);

		await transactionIndex.all();

		expect(wallet.data().set).not.toHaveBeenCalledWith("STATUS", "HOT");
	});

	it("should not set wallet status to hot when transactions are not sent or return", async () => {
		const wallet = createWalletMock();
		const transactionIndex = new TransactionIndex(wallet);

		vi.spyOn(wallet, "isCold").mockReturnValue(true);

		const mockTransactions = {
			items: () => [
				{
					isReturn: () => false,
					isSent: () => false,
					setMeta: vi.fn(),
				},
			],
		};

		vi.spyOn(wallet.client(), "transactions").mockResolvedValue(mockTransactions as any);

		await transactionIndex.all();

		expect(wallet.data().set).not.toHaveBeenCalledWith("STATUS", "HOT");
	});
});
