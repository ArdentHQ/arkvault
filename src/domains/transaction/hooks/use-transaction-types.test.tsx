import { renderHook } from "@testing-library/react";
import { useTransactionTypes } from "./use-transaction-types";
import { env } from "@/utils/testing-library";

describe("useTransactionTypes", () => {
	it("should get type icon", () => {
		const { result } = renderHook(() => useTransactionTypes());

		expect(result.current.getIcon("transfer")).toBe("Transfer");
	});

	it("should get type label", () => {
		const { result } = renderHook(() => useTransactionTypes());

		expect(result.current.getLabel("transfer")).toBe("Transfer");
	});

	it("should have core types", () => {
		const { result } = renderHook(() => useTransactionTypes());

		expect(Object.keys(result.current.types)).toStrictEqual(["core", "magistrate"]);
	});

	it("should filter only supported transaction types from wallets without magistrate", () => {
		const profile = env.profiles().first();
		const { result } = renderHook(() => useTransactionTypes({ wallets: [profile.wallets().first()] }));

		expect(result.current.types.core).toStrictEqual([
			"delegateRegistration",
			"delegateResignation",
			"multiPayment",
			"multiSignature",
			"transfer",
			"vote",
		]);
	});
});
