import {
	handleBroadcastError,
	isNoDeviceError,
	isRejectionError,
	getTransferType,
	isContractDeployment,
	withAbortPromise,
} from "./utils";

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
			const type = getTransferType({
				recipients: [
					{ address: "1", amount: 0 },
					{ address: "1", amount: 0 },
				],
			});

			expect(type).toBe("multiPayment");
		});

		it("should return transfer type if recipient is one", () => {
			const type = getTransferType({
				recipients: [{ address: "1", amount: 0 }],
			});

			expect(type).toBe("transfer");
		});
	});

	describe("isContractDeployment", () => {
		it("should return true for a contract deployment", () => {
			const transaction = {
				isUnvote: () => false,
				isUsernameRegistration: () => false,
				isUsernameResignation: () => false,
				isValidatorRegistration: () => false,
				isValidatorResignation: () => false,
				isVote: () => false,
				to: () => {},
			};
			expect(isContractDeployment(transaction as any)).toBe(true);
		});

		it("should return false for a contract transaction", () => {
			const transaction = {
				isUnvote: () => false,
				isUsernameRegistration: () => false,
				isUsernameResignation: () => false,
				isValidatorRegistration: () => true,
				isValidatorResignation: () => false,
				isVote: () => false,
				to: () => {},
			};
			expect(isContractDeployment(transaction as any)).toBe(false);
		});

		it("should return false for a transfer transaction", () => {
			const transaction = {
				isUnvote: () => false,
				isUsernameRegistration: () => false,
				isUsernameResignation: () => false,
				isValidatorRegistration: () => false,
				isValidatorResignation: () => false,
				isVote: () => false,
				to: () => "some-address",
			};
			expect(isContractDeployment(transaction as any)).toBe(false);
		});
	});

	describe("withAbortPromise", () => {
		it("should resolve the promise", async () => {
			const promise = Promise.resolve("test");
			const result = await withAbortPromise()(promise);
			expect(result).toBe("test");
		});

		it("should reject on abort", async () => {
			const controller = new AbortController();
			const promise = new Promise((resolve) => setTimeout(resolve, 1000, "test"));
			const wrappedPromise = withAbortPromise(controller.signal)(promise);

			setTimeout(() => controller.abort(), 10);

			await expect(wrappedPromise).rejects.toBe("ERR_ABORT");
		});

		it("should call the callback on abort", async () => {
			const callback = vi.fn();
			const controller = new AbortController();
			const promise = new Promise((resolve) => setTimeout(resolve, 1000, "test"));
			const wrappedPromise = withAbortPromise(controller.signal, callback)(promise);

			setTimeout(() => controller.abort(), 10);

			await expect(wrappedPromise).rejects.toBe("ERR_ABORT");
			expect(callback).toHaveBeenCalled();
		});

		it("should reject if the original promise rejects", async () => {
			const promise = Promise.reject("original error");
			const wrappedPromise = withAbortPromise()(promise);
			await expect(wrappedPromise).rejects.toBe("original error");
		});
	});
});
