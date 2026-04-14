import { buildTransferData } from "./SendTransfer.helpers";

describe("SendTransfer.helpers", () => {
	describe("buildTransferData", () => {
		it("should build data for single recipient without memo", () => {
			const result = buildTransferData({
				recipients: [{ address: "test-address", amount: "10" }],
				memo: undefined,
			});

			expect(result).toEqual({
				amount: "10",
				to: "test-address",
			});
		});

		it("should build data for single recipient with memo", () => {
			const result = buildTransferData({
				recipients: [{ address: "test-address", amount: "10" }],
				memo: "test memo",
			});

			expect(result).toEqual({
				amount: "10",
				to: "test-address",
				memo: "test memo",
			});
		});

		it("should build data for multiple recipients without memo", () => {
			const result = buildTransferData({
				recipients: [
					{ address: "address-1", amount: "5" },
					{ address: "address-2", amount: "10" },
				],
				memo: undefined,
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
				recipients: [
					{ address: "address-1", amount: "5" },
					{ address: "address-2", amount: "10" },
				],
				memo: "multi-payment memo",
			});

			expect(result).toEqual({
				payments: [
					{ amount: "5", to: "address-1" },
					{ amount: "10", to: "address-2" },
				],
				memo: "multi-payment memo",
			});
		});

		it("should handle undefined amount for single recipient", () => {
			const result = buildTransferData({
				recipients: [{ address: "test-address" }],
				memo: undefined,
			});

			expect(result).toEqual({
				amount: 0,
				to: "test-address",
			});
		});

		it("should handle undefined amount for multiple recipients", () => {
			const result = buildTransferData({
				recipients: [{ address: "address-1" }, { address: "address-2" }],
				memo: undefined,
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
				recipients: [],
				memo: undefined,
			});

			expect(result).toEqual({});
		});

		it("should return empty object when recipients is undefined", () => {
			const result = buildTransferData({
				recipients: undefined as any,
				memo: undefined,
			});

			expect(result).toEqual({});
		});
	});
});
