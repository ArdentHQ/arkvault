/* eslint-disable sonarjs/no-duplicate-string */
import { buildTransferData } from "./SendTransfer.helpers";

describe("SendTransfer.helpers", () => {
	describe("buildTransferData", () => {
		it("should build data for single recipient without memo", () => {
			const result = buildTransferData({
				memo: undefined,
				recipients: [{ address: "test-address", amount: "10" }],
			});

			expect(result).toEqual({
				amount: "10",
				to: "test-address",
			});
		});

		it("should build data for single recipient with memo", () => {
			const result = buildTransferData({
				memo: "test memo",
				recipients: [{ address: "test-address", amount: "10" }],
			});

			expect(result).toEqual({
				amount: "10",
				memo: "test memo",
				to: "test-address",
			});
		});

		it("should build data for multiple recipients without memo", () => {
			const result = buildTransferData({
				memo: undefined,
				recipients: [
					{ address: "address-1", amount: "5" },
					{ address: "address-2", amount: "10" },
				],
			});

			expect(result).toEqual({
				payments: [
					{ amount: "5", to: "address-1" },
					{ amount: "10", to: "address-2" },
				],
			});
		});

		it("should build data for multiple recipients with memo", () => {
			const result = buildTransferData({
				memo: "multi-payment memo",
				recipients: [
					{ address: "address-1", amount: "5" },
					{ address: "address-2", amount: "10" },
				],
			});

			expect(result).toEqual({
				memo: "multi-payment memo",
				payments: [
					{ amount: "5", to: "address-1" },
					{ amount: "10", to: "address-2" },
				],
			});
		});

		it("should handle undefined amount for single recipient", () => {
			const result = buildTransferData({
				memo: undefined,
				recipients: [{ address: "test-address" }],
			});

			expect(result).toEqual({
				amount: 0,
				to: "test-address",
			});
		});

		it("should handle undefined amount for multiple recipients", () => {
			const result = buildTransferData({
				memo: undefined,
				recipients: [{ address: "address-1" }, { address: "address-2" }],
			});

			expect(result).toEqual({
				payments: [
					{ amount: 0, to: "address-1" },
					{ amount: 0, to: "address-2" },
				],
			});
		});

		it("should return empty object when no recipients", () => {
			const result = buildTransferData({
				memo: undefined,
				recipients: [],
			});

			expect(result).toEqual({});
		});

		it("should return empty object when recipients is undefined", () => {
			const result = buildTransferData({
				memo: undefined,
				recipients: undefined as any,
			});

			expect(result).toEqual({});
		});
	});
});
