import { renderHook } from "@testing-library/react";
import { useTransactionTypes } from "./use-transaction-types";
import { env } from "@/utils/testing-library";

describe("useTransactionTypes", () => {
	it("should get type label", () => {
		const { result } = renderHook(() => useTransactionTypes());

		expect(result.current.getLabel("transfer")).toBe("Transfer");
		expect(result.current.getLabel("unknown-type")).toBe("Contract Deployment");
	});

	it("should get method signature", () => {
		const { result } = renderHook(() => useTransactionTypes());
		expect(result.current.getLabel("0x1234567890abcdef")).toBe("0x1234567890abcdef");
	});

	it("should return the supported transaction types", () => {
		const profile = env.profiles().first();
		const { result } = renderHook(() => useTransactionTypes({ wallets: [profile.wallets().first()] }));

		expect(result.current.types.core).toStrictEqual([
			"validatorRegistration",
			"usernameRegistration",
			"usernameResignation",
			"validatorResignation",
			"multiPayment",
			"transfer",
			"vote",
		]);
	});

	it("should return empty array if no wallets are provided", () => {
		const { result } = renderHook(() => useTransactionTypes());
		expect(result.current.types.core).toStrictEqual([]);
	});
});
