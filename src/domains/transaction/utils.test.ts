import { handleBroadcastError, isNoDeviceError, isRejectionError, getTransferType, withAbortPromise } from "./utils";

describe("Transaction utils", () => {
	describe("isNoDeviceError", () => {
		it("should return isNoDeviceError", () => {
			const error = isNoDeviceError("no device found");

			expect(error).toBe(true);
		});

		it("should return `false` in no value passed", () => {
			const error = isNoDeviceError(undefined);

			expect(error).toBe(false);
		});

		it("should return `false` in a random string passed", () => {
			const error = isNoDeviceError("random string");

			expect(error).toBe(false);
		});
	});

	describe("isRejectionError", () => {
		it("should return isRejectionError", () => {
			const error = isRejectionError("Condition of use not satisfied");

			expect(error).toBe(true);
		});
	});

	describe("handleBroadcastError", () => {
		it("should throw if rejected", () => {
			expect(() => handleBroadcastError({ accepted: [], errors: { id: "ERROR" }, rejected: ["id"] })).toThrow(
				"ERROR",
			);
		});

		it("should not throw if accepted", () => {
			expect(() => handleBroadcastError({ accepted: ["id"], errors: {}, rejected: [] })).not.toThrow();
		});
	});

	describe("transactionType", () => {
		it("should return multipayment type if recipients are more that one", () => {
			expect(
				getTransferType({
					recipients: [
						{ address: "1", amount: 0 },
						{ address: "1", amount: 0 },
					],
				}),
			).toBe("multiPayment");
		});

		it("should return transfer type if recipient is one", () => {
			expect(
				getTransferType({
					recipients: [{ address: "1", amount: 0 }],
				}),
			).toBe("transfer");
		});
	});

	describe("withAbortPromise", () => {
		it("should resolve the promise normally if not aborted", async () => {
			const resultPromise = withAbortPromise()(new Promise((resolve) => resolve("Success")));
			await expect(resultPromise).resolves.toBe("Success");
		});

		it("should reject with 'ERR_ABORT' if aborted", async () => {
			const abortController = new AbortController();
			const resultPromise = withAbortPromise(abortController.signal)(
				new Promise((resolve) => setTimeout(() => resolve("Success"), 100)),
			);

			abortController.abort();

			await expect(resultPromise).rejects.toBe("ERR_ABORT");
		});

		it("should call the callback function when aborted", async () => {
			const abortController = new AbortController();
			const mockCallback = vi.fn();
			const resultPromise = withAbortPromise(
				abortController.signal,
				mockCallback,
			)(new Promise((resolve) => setTimeout(() => resolve("Success"), 100)));

			abortController.abort();

			await expect(resultPromise).rejects.toBe("ERR_ABORT");
			expect(mockCallback).toHaveBeenCalled();
		});

		it("should not affect the rejection of the original promise", async () => {
			const errorPromise = withAbortPromise()(new Promise((_, reject) => reject("Original error")));
			await expect(errorPromise).rejects.toBe("Original error");
		});

		it("should not abort if the abort signal is never triggered", async () => {
			const abortController = new AbortController();
			const resultPromise = withAbortPromise(abortController.signal)(
				new Promise((resolve) => setTimeout(() => resolve("Success"), 100)),
			);

			await expect(resultPromise).resolves.toBe("Success");
		});
	});
});
