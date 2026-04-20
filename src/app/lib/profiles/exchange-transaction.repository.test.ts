import { describe, vi } from "vitest";
import { test } from "@/utils/testing-library";
import { expect } from "vitest";
import { ExchangeTransactionRepository } from "./exchange-transaction.repository";
import { ExchangeTransactionStatus } from "./exchange-transaction.enum";

describe("ExchangeTransactionRepository", () => {
	const exchangeTransactionData = {
		input: { address: "input-address", amount: "100", ticker: "BTC" },
		orderId: "order-1",
		output: { address: "output-address", amount: "200", ticker: "ETH" },
		provider: "test-provider",
	};

	test("#all", ({ profile }) => {
		const repository = new ExchangeTransactionRepository(profile);
		expect(repository.all()).toEqual({});
	});

	test("#keys", ({ profile }) => {
		const repository = new ExchangeTransactionRepository(profile);
		expect(repository.keys()).toEqual([]);
	});

	test("#values", ({ profile }) => {
		const repository = new ExchangeTransactionRepository(profile);
		expect(repository.values()).toEqual([]);
	});

	test("#create", ({ profile }) => {
		const repository = new ExchangeTransactionRepository(profile);
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");

		const transaction = repository.create(exchangeTransactionData);

		expect(transaction.id()).toBeDefined();
		expect(transaction.orderId()).toBe("order-1");
		expect(transaction.provider()).toBe("test-provider");
		expect(statusSpy).toHaveBeenCalled();
		statusSpy.mockRestore();
	});

	test("#create should throw if duplicate", ({ profile }) => {
		const repository = new ExchangeTransactionRepository(profile);

		repository.create(exchangeTransactionData);

		expect(() => repository.create(exchangeTransactionData)).toThrow(
			"The exchange transaction [test-provider / order-1] already exists.",
		);
	});

	test("#create should not throw for different orderId", ({ profile }) => {
		const repository = new ExchangeTransactionRepository(profile);

		repository.create(exchangeTransactionData);

		expect(() =>
			repository.create({
				...exchangeTransactionData,
				orderId: "order-2",
			}),
		).not.toThrow();
		expect(repository.count()).toBe(2);
	});

	test("#findById", ({ profile }) => {
		const repository = new ExchangeTransactionRepository(profile);

		const transaction = repository.create(exchangeTransactionData);

		const found = repository.findById(transaction.id());
		expect(found.id()).toBe(transaction.id());
	});

	test("#findById should throw if not found", ({ profile }) => {
		const repository = new ExchangeTransactionRepository(profile);
		expect(() => repository.findById("non-existent")).toThrow(
			"Failed to find an exchange transaction for [non-existent].",
		);
	});

	test("#findByStatus", ({ profile }) => {
		const repository = new ExchangeTransactionRepository(profile);

		repository.create(exchangeTransactionData);

		const results = repository.findByStatus(ExchangeTransactionStatus.New);
		expect(results).toHaveLength(1);
	});

	test("#pending", ({ profile }) => {
		const repository = new ExchangeTransactionRepository(profile);

		repository.create(exchangeTransactionData);

		const pending = repository.pending();
		expect(pending).toHaveLength(1);
	});

	test("#update", ({ profile }) => {
		const repository = new ExchangeTransactionRepository(profile);
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");

		const transaction = repository.create(exchangeTransactionData);

		repository.update(transaction.id(), { status: ExchangeTransactionStatus.Finished });

		const updated = repository.findById(transaction.id());
		expect(updated.status()).toBe(ExchangeTransactionStatus.Finished);
		expect(statusSpy).toHaveBeenCalled();
		statusSpy.mockRestore();
	});

	test("#forget", ({ profile }) => {
		const repository = new ExchangeTransactionRepository(profile);
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");

		const transaction = repository.create(exchangeTransactionData);

		repository.forget(transaction.id());

		expect(repository.count()).toBe(0);
		expect(statusSpy).toHaveBeenCalled();
		statusSpy.mockRestore();
	});

	test("#flush", ({ profile }) => {
		const repository = new ExchangeTransactionRepository(profile);
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");

		repository.create(exchangeTransactionData);

		repository.flush();

		expect(repository.count()).toBe(0);
		expect(statusSpy).toHaveBeenCalled();
		statusSpy.mockRestore();
	});

	test("#count", ({ profile }) => {
		const repository = new ExchangeTransactionRepository(profile);

		repository.create(exchangeTransactionData);

		expect(repository.count()).toBe(1);
	});

	test("#toObject", ({ profile }) => {
		const repository = new ExchangeTransactionRepository(profile);

		const transaction = repository.create(exchangeTransactionData);

		const result = repository.toObject();
		expect(result[transaction.id()]).toBeDefined();
	});

	test("#fill", ({ profile }) => {
		const repository = new ExchangeTransactionRepository(profile);

		repository.fill({
			"test-id": {
				id: "test-id",
				input: { address: "input-address", amount: "100", ticker: "BTC" },
				orderId: "order-1",
				output: { address: "output-address", amount: "200", ticker: "ETH" },
				provider: "test-provider",
				status: ExchangeTransactionStatus.New,
			},
		});

		expect(repository.count()).toBe(1);
		expect(repository.findById("test-id").orderId()).toBe("order-1");
	});

	test("should update input and output", ({ profile }) => {
		const repository = profile.exchangeTransactions();

		repository.fill({
			"test-id": {
				id: "test-id",
				input: { address: "input-address", amount: "100", ticker: "BTC" },
				orderId: "order-1",
				output: { address: "output-address", amount: "200", ticker: "ETH" },
				provider: "test-provider",
				status: ExchangeTransactionStatus.New,
			},
		});

		(repository as any).update("test-id", {
			input: { address: "new-input", amount: "50", ticker: "BTC" },
			output: { address: "new-output", amount: "75", ticker: "ETH" },
		});

		const updated = repository.findById("test-id");
		expect(updated.input().address).toBe("new-input");
		expect(updated.output().address).toBe("new-output");
	});
});
