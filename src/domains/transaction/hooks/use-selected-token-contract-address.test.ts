import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSelectedTokenContractAddress } from "./use-selected-token-contract-address";

describe("useSelectedTokenContractAddress", () => {
	const ticker = "ARK";
	it("should return tokenContractAddress when provided", () => {
		const { result } = renderHook(() =>
			useSelectedTokenContractAddress({
				isTokenTransfer: true,
				ticker,
				tokenContractAddress: "0xabc123",
				tokens: [{ token: { address: "0xdef456" } }],
			}),
		);

		expect(result.current).toBe("0xabc123");
	});

	it("should default to ticker when isTokenTransfer and no tokens", () => {
		const { result } = renderHook(() =>
			useSelectedTokenContractAddress({
				isTokenTransfer: true,
				ticker,
				tokenContractAddress: undefined,
				tokens: [],
			}),
		);

		expect(result.current).toBe("ARK");
	});

	it("should return undefined when isTokenTransfer and has one token", () => {
		const { result } = renderHook(() =>
			useSelectedTokenContractAddress({
				isTokenTransfer: true,
				ticker,
				tokenContractAddress: undefined,
				tokens: [{ token: { address: "0xdef456" } }],
			}),
		);

		expect(result.current).toBe(undefined);
	});

	it("should return undefined when isTokenTransfer and has multiple tokens", () => {
		const { result } = renderHook(() =>
			useSelectedTokenContractAddress({
				isTokenTransfer: true,
				ticker,
				tokenContractAddress: undefined,
				tokens: [{ token: { address: "0xdef456" } }, { token: { address: "0x789ghi" } }],
			}),
		);

		expect(result.current).toBe(undefined);
	});

	it("should return undefined when not a token transfer", () => {
		const { result } = renderHook(() =>
			useSelectedTokenContractAddress({
				isTokenTransfer: false,
				ticker,
				tokenContractAddress: undefined,
				tokens: [],
			}),
		);

		expect(result.current).toBe(undefined);
	});

	it("should return undefined when ticker is undefined", () => {
		const { result } = renderHook(() =>
			useSelectedTokenContractAddress({
				isTokenTransfer: true,
				ticker: undefined,
				tokenContractAddress: undefined,
				tokens: [],
			}),
		);

		expect(result.current).toBe(undefined);
	});
});
