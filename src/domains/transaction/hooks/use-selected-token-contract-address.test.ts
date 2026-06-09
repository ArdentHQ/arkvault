import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSelectedTokenContractAddress } from "./use-selected-token-contract-address";

describe("useSelectedTokenContractAddress", () => {
	const defaultTicker = "ARK";

	it("should return tokenContractAddress when provided and enabled", () => {
		const { result } = renderHook(() =>
			useSelectedTokenContractAddress({
				defaultTicker,
				enabled: true,
				tokenContractAddress: "0xabc123",
			}),
		);

		expect(result.current).toBe("0xabc123");
	});

	it("should fall back to defaultTicker when tokenContractAddress is undefined but enabled", () => {
		const { result } = renderHook(() =>
			useSelectedTokenContractAddress({
				defaultTicker,
				enabled: true,
				tokenContractAddress: undefined,
			}),
		);

		expect(result.current).toBe("ARK");
	});

	it("should return undefined when enabled is false", () => {
		const { result } = renderHook(() =>
			useSelectedTokenContractAddress({
				defaultTicker,
				enabled: false,
				tokenContractAddress: "0xabc123",
			}),
		);

		expect(result.current).toBe(undefined);
	});

	it("should return undefined when both tokenContractAddress and defaultTicker are undefined", () => {
		const { result } = renderHook(() =>
			useSelectedTokenContractAddress({
				defaultTicker: undefined,
				enabled: true,
				tokenContractAddress: undefined,
			}),
		);

		expect(result.current).toBe(undefined);
	});

	it("should return undefined when nothing is provided and not enabled", () => {
		const { result } = renderHook(() =>
			useSelectedTokenContractAddress({
				defaultTicker: undefined,
				enabled: false,
				tokenContractAddress: undefined,
			}),
		);

		expect(result.current).toBe(undefined);
	});
});
