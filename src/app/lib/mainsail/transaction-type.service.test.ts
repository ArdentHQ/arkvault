import { describe, it, expect } from "vitest";
import { TransactionTypeService, trimHexPrefix, TransactionTypes } from "./transaction-type.service";
import { Exceptions } from "./index";

const DUMMY_IDENTIFIER = "deadbeef";
const DUMMY_DATA = { data: `0x${DUMMY_IDENTIFIER}` };

describe("trimHexPrefix", () => {
	it("should remove 0x prefix", () => {
		expect(trimHexPrefix("0x1234")).toBe("1234");
	});
	it("should return string as is if no 0x", () => {
		expect(trimHexPrefix("abcd")).toBe("abcd");
	});
});

describe("TransactionTypeService", () => {
	it("isTransfer should return true for empty data", () => {
		expect(TransactionTypeService.isTransfer({ data: "" })).toBe(true);
	});

	it("isTransfer should return false for non-empty data", () => {
		expect(TransactionTypeService.isTransfer({ data: "0x1234" })).toBe(false);
	});

	it("isSecondSignature should throw NotImplemented", () => {
		expect(() => TransactionTypeService.isSecondSignature({ data: "" })).toThrow(Exceptions.NotImplemented);
	});

	it("isVoteCombination should return false", () => {
		expect(TransactionTypeService.isVoteCombination({ data: "" })).toBe(false);
	});

	it("isUpdateValidator should check identifier", () => {
		const data = { data: TransactionTypes.UpdateValidator };
		expect(TransactionTypeService.isUpdateValidator(data)).toBe(true);
	});

	it("isUpdateValidator should return false if not present", () => {
		const data = { data: "0xnotfound" };
		expect(TransactionTypeService.isUpdateValidator(data)).toBe(false);
	});
});
