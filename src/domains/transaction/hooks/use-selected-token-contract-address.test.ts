import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSelectedTokenContractAddress } from "./use-selected-token-contract-address";

describe("useSelectedTokenContractAddress", () => {
	const ticker = "ARK";
	it("should return tokenContractAddress when provided", () => {
		const { result } = renderHook(() =>
			useSelectedTokenContractAddress({
				tokenContractAddress: "0xabc123",
				isTokenTransfer: true,
				tokens: [{ token: { address: "0xdef456" } }],
				ticker,
			}),
		);

		expect(result.current).toBe("0xabc123");
	});

	it("should default to ticker when isTokenTransfer and no tokens", () => {
		const { result } = renderHook(() =>
			useSelectedTokenContractAddress({
				tokenContractAddress: undefined,
				isTokenTransfer: true,
				tokens: [],
				ticker,
			}),
		);

		expect(result.current).toBe("ARK");
	});

	it("should return undefined when isTokenTransfer and has one token", () => {
		const { result } = renderHook(() =>
			useSelectedTokenContractAddress({
				tokenContractAddress: undefined,
				isTokenTransfer: true,
				tokens: [{ token: { address: "0xdef456" } }],
				ticker,
			}),
		);

		expect(result.current).toBe(undefined);
	});

	it("should return undefined when isTokenTransfer and has multiple tokens", () => {
		const { result } = renderHook(() =>
			useSelectedTokenContractAddress({
				tokenContractAddress: undefined,
				isTokenTransfer: true,
				tokens: [{ token: { address: "0xdef456" } }, { token: { address: "0x789ghi" } }],
				ticker,
			}),
		);

		expect(result.current).toBe(undefined);
	});

	it("should return undefined when not a token transfer", () => {
		const { result } = renderHook(() =>
			useSelectedTokenContractAddress({
				tokenContractAddress: undefined,
				isTokenTransfer: false,
				tokens: [],
				ticker,
			}),
		);

		expect(result.current).toBe(undefined);
	});

	it("should return undefined when ticker is undefined", () => {
		const { result } = renderHook(() =>
			useSelectedTokenContractAddress({
				tokenContractAddress: undefined,
				isTokenTransfer: true,
				tokens: [],
				ticker: undefined,
			}),
		);

		expect(result.current).toBe(undefined);
	});
});
