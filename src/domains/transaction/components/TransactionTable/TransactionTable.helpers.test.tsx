import { renderHook } from "@testing-library/react";
import { useTransactionTableColumns } from "./TransactionTable.helpers";

describe("useTransactionTableColumns", () => {
	it("should return columns without sender column when hideSender is true", () => {
		const { result } = renderHook(() =>
			useTransactionTableColumns({
				coin: "ARK",
				hideSender: true,
			}),
		);

		const recipientColumn = result.current.find((col) => col.id === "recipient");
		expect(recipientColumn).toBeUndefined();
	});

	it("should return columns with sender column when hideSender is false", () => {
		const { result } = renderHook(() =>
			useTransactionTableColumns({
				coin: "ARK",
				hideSender: false,
			}),
		);

		const recipientColumn = result.current.find((col) => col.id === "recipient");
		expect(recipientColumn).toBeDefined();
	});

	it("should include coin in amount header when coin is provided", () => {
		const { result } = renderHook(() =>
			useTransactionTableColumns({
				coin: "BTC",
			}),
		);

		const amountColumn = result.current.find((col) => col.id === "amount");
		expect(amountColumn?.Header).toContain("BTC");
	});

	it("should not include coin label in amount header if coin is not provided", () => {
		const { result } = renderHook(() => useTransactionTableColumns({}));

		const amountColumn = result.current.find((col) => col.id === "amount");
		expect(amountColumn?.Header).toBe("Amount ");
	});
});
