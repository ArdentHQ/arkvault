import { describe, it, expect } from "vitest";
import { ExchangeTransaction } from "./exchange-transaction";
import { ExchangeTransactionStatus } from "./exchange-transaction.enum";

describe("ExchangeTransaction", () => {
	const baseInput = {
		id: "test-id",
		input: {
			address: "input-address",
			amount: "100",
			ticker: "BTC",
		},
		orderId: "order-123",
		output: {
			address: "output-address",
			amount: "200",
			ticker: "ETH",
		},
		provider: "test-provider",
	};

	it("should create an exchange transaction with default values", () => {
		const transaction = new ExchangeTransaction(baseInput);

		expect(transaction.id()).toBe("test-id");
		expect(transaction.orderId()).toBe("order-123");
		expect(transaction.provider()).toBe("test-provider");
		expect(transaction.status()).toBe(ExchangeTransactionStatus.New);
		expect(transaction.createdAt()).toBeDefined();
	});

	it("should create an exchange transaction with custom values", () => {
		const createdAt = Date.now() - 1000;
		const transaction = new ExchangeTransaction({
			...baseInput,
			createdAt,
			status: ExchangeTransactionStatus.Finished,
		});

		expect(transaction.createdAt()).toBe(createdAt);
		expect(transaction.status()).toBe(ExchangeTransactionStatus.Finished);
	});

	it("#id", () => {
		const transaction = new ExchangeTransaction(baseInput);
		expect(transaction.id()).toBe("test-id");
	});

	it("#orderId", () => {
		const transaction = new ExchangeTransaction(baseInput);
		expect(transaction.orderId()).toBe("order-123");
	});

	it("#provider", () => {
		const transaction = new ExchangeTransaction(baseInput);
		expect(transaction.provider()).toBe("test-provider");
	});

	it("#input", () => {
		const transaction = new ExchangeTransaction(baseInput);
		expect(transaction.input()).toEqual({
			address: "input-address",
			amount: "100",
			ticker: "BTC",
		});
	});

	it("#setInput", () => {
		const transaction = new ExchangeTransaction(baseInput);
		transaction.setInput({ address: "new-input", amount: "200", ticker: "BTC" });
		expect(transaction.input()).toEqual({ address: "new-input", amount: "200", ticker: "BTC" });
	});

	it("#output", () => {
		const transaction = new ExchangeTransaction(baseInput);
		expect(transaction.output()).toEqual({
			address: "output-address",
			amount: "200",
			ticker: "ETH",
		});
	});

	it("#setOutput", () => {
		const transaction = new ExchangeTransaction(baseInput);
		transaction.setOutput({ address: "new-output", amount: "300", ticker: "ETH" });
		expect(transaction.output()).toEqual({ address: "new-output", amount: "300", ticker: "ETH" });
	});

	it("#status", () => {
		const transaction = new ExchangeTransaction(baseInput);
		expect(transaction.status()).toBe(ExchangeTransactionStatus.New);
	});

	it("#setStatus", () => {
		const transaction = new ExchangeTransaction(baseInput);
		transaction.setStatus(ExchangeTransactionStatus.Finished);
		expect(transaction.status()).toBe(ExchangeTransactionStatus.Finished);
	});

	it("#isExpired", () => {
		const transaction = new ExchangeTransaction({ ...baseInput, status: ExchangeTransactionStatus.Expired });
		expect(transaction.isExpired()).toBe(true);

		const transactionNotExpired = new ExchangeTransaction({ ...baseInput, status: ExchangeTransactionStatus.New });
		expect(transactionNotExpired.isExpired()).toBe(false);
	});

	it("#isFailed", () => {
		const transaction = new ExchangeTransaction({ ...baseInput, status: ExchangeTransactionStatus.Failed });
		expect(transaction.isFailed()).toBe(true);

		const transactionNotFailed = new ExchangeTransaction({ ...baseInput, status: ExchangeTransactionStatus.New });
		expect(transactionNotFailed.isFailed()).toBe(false);
	});

	it("#isFinished", () => {
		const transaction = new ExchangeTransaction({ ...baseInput, status: ExchangeTransactionStatus.Finished });
		expect(transaction.isFinished()).toBe(true);

		const transactionNotFinished = new ExchangeTransaction({ ...baseInput, status: ExchangeTransactionStatus.New });
		expect(transactionNotFinished.isFinished()).toBe(false);
	});

	it("#isPending", () => {
		const transaction = new ExchangeTransaction({ ...baseInput, status: ExchangeTransactionStatus.New });
		expect(transaction.isPending()).toBe(true);

		const finishedTransaction = new ExchangeTransaction({
			...baseInput,
			status: ExchangeTransactionStatus.Finished,
		});
		expect(finishedTransaction.isPending()).toBe(false);
	});

	it("#isRefunded", () => {
		const transaction = new ExchangeTransaction({ ...baseInput, status: ExchangeTransactionStatus.Refunded });
		expect(transaction.isRefunded()).toBe(true);

		const transactionNotRefunded = new ExchangeTransaction({ ...baseInput, status: ExchangeTransactionStatus.New });
		expect(transactionNotRefunded.isRefunded()).toBe(false);
	});

	it("#createdAt", () => {
		const transaction = new ExchangeTransaction(baseInput);
		expect(transaction.createdAt()).toBeDefined();
		expect(typeof transaction.createdAt()).toBe("number");
	});

	it("#toObject", () => {
		const transaction = new ExchangeTransaction(baseInput);
		const obj = transaction.toObject();

		expect(obj).toEqual({
			createdAt: transaction.createdAt(),
			id: "test-id",
			input: { address: "input-address", amount: "100", ticker: "BTC" },
			orderId: "order-123",
			output: { address: "output-address", amount: "200", ticker: "ETH" },
			provider: "test-provider",
			status: ExchangeTransactionStatus.New,
		});
	});
});
