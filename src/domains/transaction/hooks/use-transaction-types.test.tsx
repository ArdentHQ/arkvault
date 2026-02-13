import { renderHook } from "@testing-library/react";
import { useTransactionTypes } from "./use-transaction-types";
import { env } from "@/utils/testing-library";
import { TransactionFixture } from "@/tests/fixtures/transactions";

describe("useTransactionTypes", () => {
	const contractDeploymentFixture = {
		...TransactionFixture,
		data: () => ({
			data: () => ({
				data: "0x60006000F3",
			}),
		}),
		isConfirmed: () => false,
		to: () => null,
		type: () => "0x60006000",
	};

	it("should get type label", () => {
		const { result } = renderHook(() => useTransactionTypes());

		expect(result.current.getLabel(TransactionFixture)).toBe("Transfer");
		expect(result.current.getLabel(contractDeploymentFixture)).toBe("Contract Deployment");
	});

	it("should get method signature", () => {
		const { result } = renderHook(() => useTransactionTypes());
		expect(result.current.getLabel(contractDeploymentFixture)).toBe("Contract Deployment");
	});

	it("should get the hash for unknown transaction", () => {
		const { result } = renderHook(() => useTransactionTypes());
		const type = "0x60003000";
		expect(
			result.current.getLabel({
				...TransactionFixture,
				data: () => ({
					data: () => ({
						data: "0x60006000F3",
					}),
				}),
				isConfirmed: () => false,
				type: () => type,
			}),
		).toBe(type);
	});

	it("should return the supported transaction types", () => {
		const profile = env.profiles().first();
		const { result } = renderHook(() => useTransactionTypes({ wallets: [profile.wallets().first()] }));

		expect(result.current.types.core).toStrictEqual([
			"validatorRegistration",
			"usernameRegistration",
			"usernameResignation",
			"updateValidator",
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
