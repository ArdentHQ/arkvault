import { describe, it, expect, beforeEach, vi } from "vitest";
import { SignedTransactionData } from "./signed-transaction.dto";
import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";
import * as TransactionTypeServiceMock from "./transaction-type.service";
import * as DecodeFunctionDataMock from "./helpers/decode-function-data";

describe("SignedTransactionData", () => {
	let transaction: SignedTransactionData;
	let mockSignedData: any;
	let mockSerialized: string;

	beforeEach(() => {
		transaction = new SignedTransactionData();
		vi.clearAllMocks();

		mockSignedData = {
			data: "12345678",
			from: "0x1234567890123456789012345678901234567890",
			gasLimit: "21000",
			gasPrice: "20000000000",
			hash: "0x1234567890abcdef",
			memo: "test memo",
			nonce: "1",
			senderPublicKey: "1234567890123456789012345678901234567890123456789012345678901234",
			timestamp: 1234567890,
			to: "0x0987654321098765432109876543210987654321",
			value: "1000000000000000000",
		};

		mockSerialized = "0xserialized_transaction_data";
	});

	describe("configure", () => {
		it("should configure transaction with signed data and serialized", () => {
			const result = transaction.configure(mockSignedData, mockSerialized);

			expect(result).toBe(transaction);
			expect(transaction.hash()).toBe(mockSignedData.hash);
			expect(transaction.from()).toBe(mockSignedData.from);
			expect(transaction.to()).toBe(mockSignedData.to);
			expect(transaction.nonce()).toBe(mockSignedData.nonce);
			expect(transaction.memo()).toBe(mockSignedData.memo);
		});

		it("should set from address from senderPublicKey when not provided", () => {
			const dataWithoutFrom = { ...mockSignedData };
			delete dataWithoutFrom.from;

			transaction.configure(dataWithoutFrom, mockSerialized);

			expect(transaction.from()).toBeDefined();
		});
	});

	describe("usesMultiSignature", () => {
		it("should return false", () => {
			expect(transaction.usesMultiSignature()).toBe(false);
		});
	});

	describe("memo", () => {
		it("should return memo from signed data", () => {
			transaction.configure(mockSignedData, mockSerialized);
			expect(transaction.memo()).toBe("test memo");
		});
	});

	describe("recipients", () => {
		it("should return single recipient for non-multi-payment", () => {
			transaction.configure(mockSignedData, mockSerialized);
			vi.spyOn(transaction, "isMultiPayment").mockReturnValue(false);
			vi.spyOn(transaction, "to").mockReturnValue("0xrecipient");
			vi.spyOn(transaction, "value").mockReturnValue(BigNumber.make(100));

			const recipients = transaction.recipients();

			expect(recipients).toHaveLength(1);
			expect(recipients[0]).toEqual({
				address: "0xrecipient",
				amount: BigNumber.make(100),
			});
		});

		it("should return multiple recipients for multi-payment", () => {
			transaction.configure(mockSignedData, mockSerialized);
			vi.spyOn(transaction, "isMultiPayment").mockReturnValue(true);
			vi.spyOn(transaction, "payments").mockReturnValue([
				{ amount: BigNumber.make(100), recipientId: "0xaddr1" },
				{ amount: BigNumber.make(200), recipientId: "0xaddr2" },
			]);

			const recipients = transaction.recipients();

			expect(recipients).toHaveLength(2);
			expect(recipients[0]).toEqual({
				address: "0xaddr1",
				amount: BigNumber.make(100),
			});
			expect(recipients[1]).toEqual({
				address: "0xaddr2",
				amount: BigNumber.make(200),
			});
		});
	});

	describe("hash", () => {
		it("should return identifier", () => {
			transaction.configure(mockSignedData, mockSerialized);
			expect(transaction.hash()).toBe(mockSignedData.hash);
		});
	});

	describe("from", () => {
		it("should return from address", () => {
			transaction.configure(mockSignedData, mockSerialized);
			expect(transaction.from()).toBe(mockSignedData.from);
		});
	});

	describe("nonce", () => {
		it("should return nonce", () => {
			transaction.configure(mockSignedData, mockSerialized);
			expect(transaction.nonce()).toBe(mockSignedData.nonce);
		});
	});

	describe("to", () => {
		it("should return to address", () => {
			transaction.configure(mockSignedData, mockSerialized);
			expect(transaction.to()).toBe(mockSignedData.to);
		});
	});

	describe("value", () => {
		it("should return value for non-multi-payment", () => {
			transaction.configure(mockSignedData, mockSerialized);
			vi.spyOn(transaction, "isMultiPayment").mockReturnValue(false);

			const value = transaction.value();
			expect(value).toBeInstanceOf(BigNumber);
		});

		it("should return sum of payments for multi-payment", () => {
			transaction.configure(mockSignedData, mockSerialized);
			vi.spyOn(transaction, "isMultiPayment").mockReturnValue(true);
			vi.spyOn(transaction, "payments").mockReturnValue([
				{ amount: BigNumber.make(100) },
				{ amount: BigNumber.make(200) },
			]);

			const value = transaction.value();
			expect(value).toEqual(BigNumber.make(300));
		});
	});

	describe("fee", () => {
		it("should calculate fee correctly", () => {
			transaction.configure(mockSignedData, mockSerialized);
			const fee = transaction.fee();
			expect(fee).toBeInstanceOf(BigNumber);
		});
	});

	describe("timestamp", () => {
		it("should return timestamp from signed data", () => {
			transaction.configure(mockSignedData, mockSerialized);
			const timestamp = transaction.timestamp();
			expect(timestamp).toBeInstanceOf(DateTime);
		});

		it("should return current timestamp when not provided", () => {
			const dataWithoutTimestamp = { ...mockSignedData };
			delete dataWithoutTimestamp.timestamp;
			transaction.configure(dataWithoutTimestamp, mockSerialized);

			const timestamp = transaction.timestamp();
			expect(timestamp).toBeInstanceOf(DateTime);
		});
	});

	describe("votes", () => {
		it("should decode vote data correctly", () => {
			transaction.configure(mockSignedData, mockSerialized);
			vi.spyOn(DecodeFunctionDataMock, "decodeFunctionData").mockReturnValue({
				args: ["0x1234567890123456789012345678901234567890"],
			});

			const votes = transaction.votes();
			expect(votes).toEqual(["0x1234567890123456789012345678901234567890"]);
		});

		it("should add 0x prefix if not present", () => {
			const dataWithHex = { ...mockSignedData, data: "12345678" };
			transaction.configure(dataWithHex, mockSerialized);
			vi.spyOn(DecodeFunctionDataMock, "decodeFunctionData").mockReturnValue({
				args: ["0x1234567890123456789012345678901234567890"],
			});

			const votes = transaction.votes();
			expect(votes).toEqual(["0x1234567890123456789012345678901234567890"]);
		});

		it("should not add 0x prefix if already present", () => {
			const dataWith0x = { ...mockSignedData, data: "0xabcdef12" };
			transaction.configure(dataWith0x, mockSerialized);
			vi.spyOn(DecodeFunctionDataMock, "decodeFunctionData").mockReturnValue({ args: ["0x1234567890"] });
			const votes = transaction.votes();
			expect(votes).toEqual(["0x1234567890"]);
		});
	});

	describe("unvotes", () => {
		it("should return empty array", () => {
			transaction.configure(mockSignedData, mockSerialized);
			expect(transaction.unvotes()).toEqual([]);
		});
	});

	describe("transaction type checks", () => {
		beforeEach(() => {
			transaction.configure(mockSignedData, mockSerialized);
		});

		it("should check isTransfer", () => {
			vi.spyOn(TransactionTypeServiceMock.TransactionTypeService, "isTransfer").mockReturnValue(true);
			expect(transaction.isTransfer()).toBe(true);
		});

		it("should check isSecondSignature", () => {
			expect(transaction.isSecondSignature()).toBe(false);
		});

		it("should check isUsernameRegistration", () => {
			vi.spyOn(TransactionTypeServiceMock.TransactionTypeService, "isUsernameRegistration").mockReturnValue(true);
			expect(transaction.isUsernameRegistration()).toBe(true);
		});

		it("should check isUsernameResignation", () => {
			vi.spyOn(TransactionTypeServiceMock.TransactionTypeService, "isUsernameResignation").mockReturnValue(true);
			expect(transaction.isUsernameResignation()).toBe(true);
		});

		it("should check isValidatorRegistration", () => {
			vi.spyOn(TransactionTypeServiceMock.TransactionTypeService, "isValidatorRegistration").mockReturnValue(
				true,
			);
			expect(transaction.isValidatorRegistration()).toBe(true);
		});

		it("should check isUpdateValidator", () => {
			vi.spyOn(TransactionTypeServiceMock.TransactionTypeService, "isUpdateValidator").mockReturnValue(true);
			expect(transaction.isUpdateValidator()).toBe(true);
		});

		it("should check isVoteCombination", () => {
			vi.spyOn(TransactionTypeServiceMock.TransactionTypeService, "isVoteCombination").mockReturnValue(true);
			expect(transaction.isVoteCombination()).toBe(true);
		});

		it("should check isVote", () => {
			vi.spyOn(TransactionTypeServiceMock.TransactionTypeService, "isVote").mockReturnValue(true);
			expect(transaction.isVote()).toBe(true);
		});

		it("should check isUnvote", () => {
			vi.spyOn(TransactionTypeServiceMock.TransactionTypeService, "isUnvote").mockReturnValue(true);
			expect(transaction.isUnvote()).toBe(true);
		});

		it("should check isMultiPayment", () => {
			vi.spyOn(TransactionTypeServiceMock.TransactionTypeService, "isMultiPayment").mockReturnValue(true);
			expect(transaction.isMultiPayment()).toBe(true);
		});

		it("should check isValidatorResignation", () => {
			vi.spyOn(TransactionTypeServiceMock.TransactionTypeService, "isValidatorResignation").mockReturnValue(true);
			expect(transaction.isValidatorResignation()).toBe(true);
		});
	});

	describe("payments", () => {
		it("should decode multi-payment data correctly", () => {
			transaction.configure(mockSignedData, mockSerialized);
			vi.spyOn(DecodeFunctionDataMock, "decodeFunctionData").mockReturnValue({
				args: [
					["0xaddr1", "0xaddr2"],
					["1000000000000000000", "2000000000000000000"],
				],
			});

			const payments = transaction.payments();
			expect(payments).toHaveLength(2);
			expect(payments[0]).toEqual({
				amount: expect.any(BigNumber),
				recipientId: "0xaddr1",
			});
			expect(payments[1]).toEqual({
				amount: expect.any(BigNumber),
				recipientId: "0xaddr2",
			});
		});
	});

	describe("username", () => {
		it("should decode username data correctly", () => {
			transaction.configure(mockSignedData, mockSerialized);
			vi.spyOn(DecodeFunctionDataMock, "decodeFunctionData").mockReturnValue({
				args: ["testuser"],
			});

			const username = transaction.username();
			expect(username).toBe("testuser");
		});

		it("should return data as is if already starts with 0x (username)", () => {
			const dataWith0x = { ...mockSignedData, data: "0xabcdef12" };
			transaction.configure(dataWith0x, mockSerialized);
			vi.spyOn(DecodeFunctionDataMock, "decodeFunctionData").mockReturnValue({ args: ["user0x"] });
			const username = transaction.username();
			expect(username).toBe("user0x");
		});
	});

	describe("validatorPublicKey", () => {
		it("should decode validator public key and remove 0x prefix", () => {
			transaction.configure(mockSignedData, mockSerialized);
			vi.spyOn(DecodeFunctionDataMock, "decodeFunctionData").mockReturnValue({
				args: ["0x1234567890123456789012345678901234567890123456789012345678901234"],
			});

			const publicKey = transaction.validatorPublicKey();
			expect(publicKey).toBe("1234567890123456789012345678901234567890123456789012345678901234");
		});
	});

	describe("methodHash", () => {
		it("should return method hash from first 8 characters", () => {
			transaction.configure(mockSignedData, mockSerialized);
			const methodHash = transaction.methodHash();
			expect(methodHash).toBe("0x12345678");
		});
	});

	describe("toBroadcast", () => {
		it("should return serialized data", () => {
			transaction.configure(mockSignedData, mockSerialized);
			expect(transaction.toBroadcast()).toBe(mockSerialized);
		});
	});

	describe("toString", () => {
		it("should return string representation of signed data", () => {
			transaction.configure(mockSignedData, mockSerialized);
			const result = transaction.toString();
			expect(typeof result).toBe("string");
		});

		it("should return signed data directly when it is a string", () => {
			const stringData = "string_transaction_data";
			// Mock the signedData property directly to test the string case
			(transaction as any).signedData = stringData;
			const result = transaction.toString();
			expect(result).toBe(stringData);
		});
	});

	describe("get", () => {
		it("should return value from signed data", () => {
			transaction.configure(mockSignedData, mockSerialized);
			expect(transaction.get("hash")).toBe(mockSignedData.hash);
			expect(transaction.get("from")).toBe(mockSignedData.from);
		});
	});

	describe("data", () => {
		it("should return signed data", () => {
			transaction.configure(mockSignedData, mockSerialized);
			expect(transaction.data()).toBe(mockSignedData);
		});
	});

	describe("toObject", () => {
		it("should return object representation", () => {
			transaction.configure(mockSignedData, mockSerialized);
			vi.spyOn(transaction, "isMultiPayment").mockReturnValue(false);
			const result = transaction.toObject();

			expect(result).toHaveProperty("broadcast");
			expect(result).toHaveProperty("data");
			expect(result).toHaveProperty("fee");
			expect(result).toHaveProperty("from");
			expect(result).toHaveProperty("hash");
			expect(result).toHaveProperty("timestamp");
			expect(result).toHaveProperty("to");
			expect(result).toHaveProperty("value");
		});
	});

	describe("toSignedData", () => {
		it("should return normalized signed data", () => {
			transaction.configure(mockSignedData, mockSerialized);
			const result = transaction.toSignedData();
			expect(result).toBeDefined();
		});

		it("should normalize bigint values", () => {
			const dataWithBigInt = {
				...mockSignedData,
				bigintValue: BigInt(123456789),
			};
			transaction.configure(dataWithBigInt, mockSerialized);
			const result = transaction.toSignedData();
			expect(result.bigintValue).toBe("123456789");
		});

		it("should normalize timestamp values", () => {
			const dataWithTimestamp = {
				...mockSignedData,
				timestamp: 1234567890,
			};
			transaction.configure(dataWithTimestamp, mockSerialized);
			const result = transaction.toSignedData();
			expect(result.timestamp).toBeDefined();
		});

		it("should normalize amount, nonce, fee values", () => {
			const dataWithAmounts = {
				...mockSignedData,
				amount: BigNumber.make(100),
				fee: BigNumber.make(10),
				nonce: BigNumber.make(1),
			};
			transaction.configure(dataWithAmounts, mockSerialized);
			const result = transaction.toSignedData();
			expect(typeof result.amount).toBe("string");
			expect(typeof result.nonce).toBe("string");
			expect(typeof result.fee).toBe("string");
		});

		it("should normalize Map values", () => {
			const dataWithMap = {
				...mockSignedData,
				mapValue: new Map([["key", "value"]]),
			};
			transaction.configure(dataWithMap, mockSerialized);
			const result = transaction.toSignedData();
			expect(result.mapValue).toEqual({ key: "value" });
		});
	});

	describe("type", () => {
		beforeEach(() => {
			transaction.configure(mockSignedData, mockSerialized);
		});

		it("should return voteCombination when isVoteCombination is true", () => {
			vi.spyOn(transaction, "isVoteCombination").mockReturnValue(true);
			expect(transaction.type()).toBe("voteCombination");
		});

		it("should return transfer when isTransfer is true", () => {
			vi.spyOn(transaction, "isVoteCombination").mockReturnValue(false);
			vi.spyOn(transaction, "isMultiPayment").mockReturnValue(false);
			vi.spyOn(transaction, "isSecondSignature").mockReturnValue(false);
			vi.spyOn(transaction, "isUsernameRegistration").mockReturnValue(false);
			vi.spyOn(transaction, "isUsernameResignation").mockReturnValue(false);
			vi.spyOn(transaction, "isUnvote").mockReturnValue(false);
			vi.spyOn(transaction, "isValidatorRegistration").mockReturnValue(false);
			vi.spyOn(transaction, "isValidatorResignation").mockReturnValue(false);
			vi.spyOn(transaction, "isVote").mockReturnValue(false);
			vi.spyOn(transaction, "isUpdateValidator").mockReturnValue(false);
			vi.spyOn(transaction, "isTransfer").mockReturnValue(true);
			expect(transaction.type()).toBe("transfer");
		});

		it("should return multiPayment when isMultiPayment is true", () => {
			vi.spyOn(transaction, "isVoteCombination").mockReturnValue(false);
			vi.spyOn(transaction, "isTransfer").mockReturnValue(false);
			vi.spyOn(transaction, "isMultiPayment").mockReturnValue(true);
			expect(transaction.type()).toBe("multiPayment");
		});

		it("should return methodHash when no specific type matches", () => {
			vi.spyOn(transaction, "isVoteCombination").mockReturnValue(false);
			vi.spyOn(transaction, "isTransfer").mockReturnValue(false);
			vi.spyOn(transaction, "isMultiPayment").mockReturnValue(false);
			vi.spyOn(transaction, "isSecondSignature").mockReturnValue(false);
			vi.spyOn(transaction, "isUsernameRegistration").mockReturnValue(false);
			vi.spyOn(transaction, "isUsernameResignation").mockReturnValue(false);
			vi.spyOn(transaction, "isUnvote").mockReturnValue(false);
			vi.spyOn(transaction, "isValidatorRegistration").mockReturnValue(false);
			vi.spyOn(transaction, "isValidatorResignation").mockReturnValue(false);
			vi.spyOn(transaction, "isVote").mockReturnValue(false);
			vi.spyOn(transaction, "isUpdateValidator").mockReturnValue(false);

			expect(transaction.type()).toBe("0x12345678");
		});

		it("should return secondSignature when isSecondSignature is true", () => {
			vi.spyOn(transaction, "isVoteCombination").mockReturnValue(false);
			vi.spyOn(transaction, "isMultiPayment").mockReturnValue(false);
			vi.spyOn(transaction, "isSecondSignature").mockReturnValue(true);
			expect(transaction.type()).toBe("secondSignature");
		});

		it("should return usernameRegistration when isUsernameRegistration is true", () => {
			vi.spyOn(transaction, "isVoteCombination").mockReturnValue(false);
			vi.spyOn(transaction, "isMultiPayment").mockReturnValue(false);
			vi.spyOn(transaction, "isSecondSignature").mockReturnValue(false);
			vi.spyOn(transaction, "isTransfer").mockReturnValue(false);
			vi.spyOn(transaction, "isUsernameRegistration").mockReturnValue(true);
			expect(transaction.type()).toBe("usernameRegistration");
		});

		it("should return usernameResignation when isUsernameResignation is true", () => {
			vi.spyOn(transaction, "isVoteCombination").mockReturnValue(false);
			vi.spyOn(transaction, "isMultiPayment").mockReturnValue(false);
			vi.spyOn(transaction, "isSecondSignature").mockReturnValue(false);
			vi.spyOn(transaction, "isTransfer").mockReturnValue(false);
			vi.spyOn(transaction, "isUsernameRegistration").mockReturnValue(false);
			vi.spyOn(transaction, "isUsernameResignation").mockReturnValue(true);
			expect(transaction.type()).toBe("usernameResignation");
		});

		it("should return unvote when isUnvote is true", () => {
			vi.spyOn(transaction, "isVoteCombination").mockReturnValue(false);
			vi.spyOn(transaction, "isMultiPayment").mockReturnValue(false);
			vi.spyOn(transaction, "isSecondSignature").mockReturnValue(false);
			vi.spyOn(transaction, "isTransfer").mockReturnValue(false);
			vi.spyOn(transaction, "isUsernameRegistration").mockReturnValue(false);
			vi.spyOn(transaction, "isUsernameResignation").mockReturnValue(false);
			vi.spyOn(transaction, "isUnvote").mockReturnValue(true);
			expect(transaction.type()).toBe("unvote");
		});

		it("should return validatorRegistration when isValidatorRegistration is true", () => {
			vi.spyOn(transaction, "isVoteCombination").mockReturnValue(false);
			vi.spyOn(transaction, "isMultiPayment").mockReturnValue(false);
			vi.spyOn(transaction, "isSecondSignature").mockReturnValue(false);
			vi.spyOn(transaction, "isTransfer").mockReturnValue(false);
			vi.spyOn(transaction, "isUsernameRegistration").mockReturnValue(false);
			vi.spyOn(transaction, "isUsernameResignation").mockReturnValue(false);
			vi.spyOn(transaction, "isUnvote").mockReturnValue(false);
			vi.spyOn(transaction, "isValidatorRegistration").mockReturnValue(true);
			expect(transaction.type()).toBe("validatorRegistration");
		});

		it("should return validatorResignation when isValidatorResignation is true", () => {
			vi.spyOn(transaction, "isVoteCombination").mockReturnValue(false);
			vi.spyOn(transaction, "isMultiPayment").mockReturnValue(false);
			vi.spyOn(transaction, "isSecondSignature").mockReturnValue(false);
			vi.spyOn(transaction, "isTransfer").mockReturnValue(false);
			vi.spyOn(transaction, "isUsernameRegistration").mockReturnValue(false);
			vi.spyOn(transaction, "isUsernameResignation").mockReturnValue(false);
			vi.spyOn(transaction, "isUnvote").mockReturnValue(false);
			vi.spyOn(transaction, "isValidatorRegistration").mockReturnValue(false);
			vi.spyOn(transaction, "isValidatorResignation").mockReturnValue(true);
			expect(transaction.type()).toBe("validatorResignation");
		});

		it("should return vote when isVote is true", () => {
			vi.spyOn(transaction, "isVoteCombination").mockReturnValue(false);
			vi.spyOn(transaction, "isMultiPayment").mockReturnValue(false);
			vi.spyOn(transaction, "isSecondSignature").mockReturnValue(false);
			vi.spyOn(transaction, "isTransfer").mockReturnValue(false);
			vi.spyOn(transaction, "isUsernameRegistration").mockReturnValue(false);
			vi.spyOn(transaction, "isUsernameResignation").mockReturnValue(false);
			vi.spyOn(transaction, "isUnvote").mockReturnValue(false);
			vi.spyOn(transaction, "isValidatorRegistration").mockReturnValue(false);
			vi.spyOn(transaction, "isValidatorResignation").mockReturnValue(false);
			vi.spyOn(transaction, "isVote").mockReturnValue(true);
			expect(transaction.type()).toBe("vote");
		});

		it("should return updateValidator when isUpdateValidator is true", () => {
			vi.spyOn(transaction, "isVoteCombination").mockReturnValue(false);
			vi.spyOn(transaction, "isMultiPayment").mockReturnValue(false);
			vi.spyOn(transaction, "isSecondSignature").mockReturnValue(false);
			vi.spyOn(transaction, "isTransfer").mockReturnValue(false);
			vi.spyOn(transaction, "isUsernameRegistration").mockReturnValue(false);
			vi.spyOn(transaction, "isUsernameResignation").mockReturnValue(false);
			vi.spyOn(transaction, "isUnvote").mockReturnValue(false);
			vi.spyOn(transaction, "isValidatorRegistration").mockReturnValue(false);
			vi.spyOn(transaction, "isValidatorResignation").mockReturnValue(false);
			vi.spyOn(transaction, "isVote").mockReturnValue(false);
			vi.spyOn(transaction, "isUpdateValidator").mockReturnValue(true);
			expect(transaction.type()).toBe("updateValidator");
		});
	});

	describe("gasLimit", () => {
		it("should return gas limit", () => {
			transaction.configure(mockSignedData, mockSerialized);
			expect(transaction.gasLimit()).toBe("21000");
		});
	});

	describe("gasUsed", () => {
		it("should return gas used", () => {
			transaction.configure(mockSignedData, mockSerialized);
			expect(transaction.gasUsed()).toBe(20);
		});
	});
});
