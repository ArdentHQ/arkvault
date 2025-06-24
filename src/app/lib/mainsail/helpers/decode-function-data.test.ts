import { describe, it, expect } from "vitest";
import { decodeFunctionData, AbiType } from "./decode-function-data";
import { Hex } from "viem";

describe("decodeFunctionData", () => {
	it("should decode consensus function data", () => {
		const data = "0x1904bb2e000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" as Hex;
		const decoded = decodeFunctionData(data, AbiType.Consensus);
		expect(decoded.functionName).toBe("getValidator");
		expect(decoded.args).not.toBeUndefined();
	});

	it("should decode username function data", () => {
		const data = "0xce43c032000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" as Hex;
		const decoded = decodeFunctionData(data, AbiType.Username);
		expect(decoded.functionName).toBe("getUsername");
		expect(decoded.args).toEqual(["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"]);
	});

	it("should decode multi-payment function data", () => {
		const data =
			"0x084ce708000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4800000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001" as Hex;
		const decoded = decodeFunctionData(data, AbiType.MultiPayment);
		expect(decoded.functionName).toBe("pay");
		expect(decoded.args).not.toBeUndefined();
	});

	it("should use consensus abi by default", () => {
		const data = "0x1904bb2e000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" as Hex;
		const decoded = decodeFunctionData(data);
		expect(decoded.functionName).toBe("getValidator");
		expect(decoded.args).not.toBeUndefined();
	});

	it("should throw an error for invalid data", () => {
		const data = "0xinvaliddata" as Hex;
		expect(() => decodeFunctionData(data)).toThrow();
	});
});
