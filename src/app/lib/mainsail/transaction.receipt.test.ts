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
		it("should return false when transaction is successful", () => {
			const receipt = new TransactionReceipt({ gasRefunded: 0, gasUsed: 50, status: 1 }, 100);
			expect(receipt.hasUnknownError()).toBe(false);
		});

		it("should return false when it is an insufficient gas error", () => {
			const receipt = new TransactionReceipt({
				decodedError: "some error",
				gasRefunded: 0,
				gasUsed: 96,
				status: 0
			}, 100);
			expect(receipt.hasUnknownError()).toBe(false);
		});

		it("should return true for execution reverted errors", () => {
			const receipt = new TransactionReceipt({
				decodedError: "execution reverted",
				gasRefunded: 0,
				gasUsed: 50,
				status: 0
			}, 100);
			expect(receipt.hasUnknownError()).toBe(true);
		});

		it("should return true when no error message is present", () => {
			const receipt = new TransactionReceipt({ gasRefunded: 0, gasUsed: 50, status: 0 }, 100);
			expect(receipt.hasUnknownError()).toBe(true);
		});

		it("should return false for known error messages", () => {
			const receipt = new TransactionReceipt({
				decodedError: "TakenUsername",
				gasRefunded: 0,
				gasUsed: 50,
				status: 0
			}, 100);
			expect(receipt.hasUnknownError()).toBe(false);
		});
	});

	describe("#error", () => {
		it("should return undefined when transaction is successful", () => {
			const receipt = new TransactionReceipt({ gasRefunded: 0, gasUsed: 50, status: 1 }, 100);
			expect(receipt.error()).toBe(undefined);
		});

		it("should return decodedError when transaction fails", () => {
			const receipt = new TransactionReceipt({
				decodedError: "TakenUsername",
				gasRefunded: 0,
				gasUsed: 50,
				status: 0
			}, 100);
			expect(receipt.error()).toBe("TakenUsername");
		});

		it("should return undefined when no decodedError is present", () => {
			const receipt = new TransactionReceipt({ gasRefunded: 0, gasUsed: 50, status: 0 }, 100);
			expect(receipt.error()).toBe(undefined);
		});
	});

	describe("#prettyError", () => {
		it("should return undefined for successful transactions", () => {
			const receipt = new TransactionReceipt({ gasRefunded: 0, gasUsed: 1000, status: 1 });
			expect(receipt.prettyError()).toBeUndefined();
		});

		it("should return 'Out of gas?' for execution reverted with high gas usage", () => {
			const receipt = new TransactionReceipt(
				{ decodedError: "execution reverted", gasRefunded: 0, gasUsed: 96, status: 0 },
				100 // gasLimit
			);
			expect(receipt.prettyError()).toBe("Out of gas?");
		});

		it("should format errors with no spaces by splitting on caps", () => {
			const receipt = new TransactionReceipt({
				decodedError: "TakenUsername",
				gasRefunded: 0,
				gasUsed: 50,
				status: 0
			}, 100);
			expect(receipt.prettyError()).toBe("Taken Username");
		});

		it("should capitalize first letter of errors with spaces", () => {
			const receipt = new TransactionReceipt({
				decodedError: "out of gas",
				gasRefunded: 0,
				gasUsed: 50,
				status: 0
			}, 100);
			expect(receipt.prettyError()).toBe("Out of gas");
		});

		it("should handle execution reverted with low gas usage normally", () => {
			const receipt = new TransactionReceipt(
				{ decodedError: "execution reverted", gasRefunded: 0, gasUsed: 50, status: 0 },
				100 // gasLimit
			);
			expect(receipt.prettyError()).toBe("Execution reverted");
		});

		it("should return undefined when no error is present", () => {
			const receipt = new TransactionReceipt({
				gasRefunded: 0,
				gasUsed: 50,
				status: 0
			}, 100);
			expect(receipt.prettyError()).toBeUndefined();
		});
	});
});
