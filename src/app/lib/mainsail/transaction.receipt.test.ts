import { TransactionReceipt } from "./transaction.receipt";

describe("TransactionReceipt", () => {
	describe("#isSuccess", () => {
		it("should return true when status is 1", () => {
			const receipt = new TransactionReceipt({ gasRefunded: 0, gasUsed: 21000, status: 1 }, 100_000);
			expect(receipt.isSuccess()).toBe(true);
		});

		it("should return false when status is not 1", () => {
			const receipt = new TransactionReceipt({ gasRefunded: 0, gasUsed: 21000, status: 0 }, 100_000);
			expect(receipt.isSuccess()).toBe(false);
		});
	});

	describe("#hasInsufficientGasError", () => {
		it("should return false when gas usage is below or equal to threshold", () => {
			const receipt = new TransactionReceipt({ gasRefunded: 0, gasUsed: 95, status: 0 }, 100);
			expect(receipt.hasInsufficientGasError()).toBe(false);
		});

		it("should return true when gas usage is above threshold", () => {
			const receipt = new TransactionReceipt({ gasRefunded: 0, gasUsed: 96, status: 0 }, 100);
			expect(receipt.hasInsufficientGasError()).toBe(true);
		});

		it("should throw when gasLimit is not provided", () => {
			const receipt = new TransactionReceipt({ gasRefunded: 0, gasUsed: 21000, status: 0 }, 0);
			expect(() => receipt.hasInsufficientGasError()).toThrow(
				"[TransactionReceipt#hasInsufficientGasError] Gas limit is not provided.",
			);
		});
	});

	describe("#hasUnknownError", () => {
		it("should return true when not success and not insufficient gas", () => {
			const receipt = new TransactionReceipt({ gasRefunded: 0, gasUsed: 50, status: 0 }, 100);
			expect(receipt.hasUnknownError()).toBe(true);
		});

		it("should return false when transaction is successful", () => {
			const receipt = new TransactionReceipt({ gasRefunded: 0, gasUsed: 50, status: 1 }, 100);
			expect(receipt.hasUnknownError()).toBe(false);
		});

		it("should return false when it is an insufficient gas error", () => {
			const receipt = new TransactionReceipt({ gasRefunded: 0, gasUsed: 96, status: 0 }, 100);
			expect(receipt.hasUnknownError()).toBe(false);
		});
	});

	describe("#error", () => {
		it("should return undefined when transaction is successful", () => {
			const receipt = new TransactionReceipt({ gasRefunded: 0, gasUsed: 50, output: "0x", status: 1 }, 100);
			expect(receipt.error()).toBe(undefined);
		});

		it("should return undefined when output is empty", () => {
			const receipt = new TransactionReceipt({ gasRefunded: 0, gasUsed: 50, status: 0 }, 100);
			expect(receipt.error()).toBe(undefined);
		});

		it("should return undefined when output it 0x", () => {
			const receipt = new TransactionReceipt({ gasRefunded: 0, gasUsed: 50, output: "0x", status: 0 }, 100);
			expect(receipt.error()).toBe(undefined);
		});

		it("should return error", () => {
			const receipt = new TransactionReceipt({ gasRefunded: 0, gasUsed: 96, output: "0xa0ca2f4e", status: 0 }, 100);
			expect(receipt.error()).toBe("TakenUsername");
		});

		it("should return undefined when error name couldn't be found", () => {
			const receipt = new TransactionReceipt({ gasRefunded: 0, gasUsed: 96, output: "0xacadef", status: 0 }, 100);
			expect(receipt.error()).toBe(undefined);
		});
	});
});
