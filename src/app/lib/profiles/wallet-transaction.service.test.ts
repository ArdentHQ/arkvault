import { describe, test, vi, expect, beforeEach, afterEach } from "vitest";
import { BigNumber } from "@/app/lib/helpers";
import { Contracts } from "@/app/lib/profiles";
import { Services } from "@/app/lib/mainsail";
import { ExtendedSignedTransactionData } from "./signed-transaction.dto";
import { SignedTransactionData } from "@/app/lib/mainsail/signed-transaction.dto";
import { TransactionService } from "./wallet-transaction.service";
import { Address } from "@arkecosystem/typescript-crypto";

const TRANSACTION_ID = "transaction-id";
const TRANSACTION_HASH = "transaction-hash";

vi.mock("./signed-transaction.dto", () => ({
	ExtendedSignedTransactionData: vi.fn().mockImplementation((data, wallet) => ({
		hash: () => data.hash(),
		isMultiSignatureRegistration: () => false,
	})),
}));

const mockTransactionMethod = vi.fn();

const mockMainsailTransactionService = {
	delegateRegistration: mockTransactionMethod,
	delegateResignation: mockTransactionMethod,
	multiPayment: mockTransactionMethod,
	secondSignature: mockTransactionMethod,
	transfer: mockTransactionMethod,
	updateValidator: mockTransactionMethod,
	usernameRegistration: mockTransactionMethod,
	usernameResignation: mockTransactionMethod,
	validatorRegistration: mockTransactionMethod,
	validatorResignation: mockTransactionMethod,
	vote: mockTransactionMethod,
};

const mockWallet = {
	address: () => "wallet-address",
	data: () => ({
		forget: vi.fn(),
		get: vi.fn().mockReturnValue(undefined),
		set: vi.fn(),
	}),
	isMultiSignature: () => false,
	profile: () => ({ data: () => ({ get: vi.fn(), set: vi.fn() }) }),
	publicKey: () => "wallet-public-key",
	signatory: () => ({ signingKey: () => "signing-key" }),
	transaction: () => ({ dump: vi.fn() }),
	transactionService: () => mockMainsailTransactionService,
} as unknown as Contracts.IReadWriteWallet;

describe("TransactionService", () => {
	let subject: TransactionService;

	beforeEach(() => {
		vi.clearAllMocks();

		vi.spyOn(Address, "fromPublicKey").mockReturnValue({} as any);

		const mockSignedTxData = new SignedTransactionData().configure(
			{ hash: TRANSACTION_HASH, senderPublicKey: "pubkey" },
			"serialized-tx",
		);

		mockTransactionMethod.mockResolvedValue(mockSignedTxData);

		const restoreSpy = vi.spyOn(TransactionService.prototype, "restore").mockImplementation(() => {});
		subject = new TransactionService(mockWallet);
		restoreSpy.mockRestore();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	test("should sign a transfer", async () => {
		const input: Services.TransferInput = {
			data: { amount: "1", to: "recipient-address" },
			gasLimit: BigNumber.make(1),
			gasPrice: BigNumber.make(1),
			signatory: {} as any,
		};

		const result = await subject.signTransfer(input);

		expect(result).toBe(TRANSACTION_HASH);
		expect(mockTransactionMethod).toHaveBeenCalledWith(input);
	});

	test("should sign a second signature", async () => {
		const input: Services.SecondSignatureInput = {
			data: { mnemonic: "a mnemonic" },
			signatory: {} as any,
		};
		const result = await subject.signSecondSignature(input);
		expect(result).toBe(TRANSACTION_HASH);
		expect(mockTransactionMethod).toHaveBeenCalledWith(input);
	});

	test("should sign a username registration", async () => {
		const input: Services.UsernameRegistrationInput = {
			data: { username: "test-user" },
			signatory: {} as any,
		};
		const result = await subject.signUsernameRegistration(input);
		expect(result).toBe(TRANSACTION_HASH);
		expect(mockTransactionMethod).toHaveBeenCalledWith(input);
	});

	test("should sign a username resignation", async () => {
		const input: Services.UsernameResignationInput = { signatory: {} as any };
		const result = await subject.signUsernameResignation(input);
		expect(result).toBe(TRANSACTION_HASH);
		expect(mockTransactionMethod).toHaveBeenCalledWith(input);
	});

	test("should sign a delegate registration", async () => {
		const input: Services.ValidatorRegistrationInput = {
			data: { validatorPublicKey: "validator-public-key", value: 100 },
			signatory: {} as any,
		};
		const result = await subject.signDelegateRegistration(input);
		expect(result).toBe(TRANSACTION_HASH);
		expect(mockTransactionMethod).toHaveBeenCalledWith(input);
	});

	test("should sign a validator registration", async () => {
		const input: Services.ValidatorRegistrationInput = {
			data: { validatorPublicKey: "validator-public-key", value: 100 },
			signatory: {} as any,
		};
		const result = await subject.signValidatorRegistration(input);
		expect(result).toBe(TRANSACTION_HASH);
		expect(mockTransactionMethod).toHaveBeenCalledWith(input);
	});

	test("should sign a vote", async () => {
		const input: Services.VoteInput = {
			data: { votes: [{ amount: 0, id: "vote-id" }] },
			signatory: {} as any,
		};
		const result = await subject.signVote(input);
		expect(result).toBe(TRANSACTION_HASH);
		expect(mockTransactionMethod).toHaveBeenCalledWith(input);
	});

	test("should sign a multi-payment", async () => {
		const input: Services.MultiPaymentInput = {
			data: { payments: [{ amount: 10, to: "address-1" }] },
			signatory: {} as any,
		};
		const result = await subject.signMultiPayment(input);
		expect(result).toBe(TRANSACTION_HASH);
		expect(mockTransactionMethod).toHaveBeenCalledWith(input);
	});

	test("should sign a delegate resignation", async () => {
		const input: Services.ValidatorResignationInput = { signatory: {} as any };
		const result = await subject.signDelegateResignation(input);
		expect(result).toBe(TRANSACTION_HASH);
		expect(mockTransactionMethod).toHaveBeenCalledWith(input);
	});

	test("should sign a validator resignation", async () => {
		const input: Services.ValidatorResignationInput = { signatory: {} as any };
		const result = await subject.signValidatorResignation(input);
		expect(result).toBe(TRANSACTION_HASH);
		expect(mockTransactionMethod).toHaveBeenCalledWith(input);
	});

	test("should sign an update validator transaction", async () => {
		const input: Services.UpdateValidatorInput = {
			data: { validatorPublicKey: "new-public-key" },
			signatory: {} as any,
		};
		const result = await subject.signUpdateValidator(input);
		expect(result).toBe(TRANSACTION_HASH);
		expect(mockTransactionMethod).toHaveBeenCalledWith(input);
	});

	test("should find a transaction by its ID", async () => {
		const id = await subject.signTransfer({
			signatory: {} as any,
			data: { amount: "1", to: "recipient-address" },
			gasLimit: BigNumber.make(1),
			gasPrice: BigNumber.make(1),
		});

		const result = subject.transaction(id);
		expect(result.hash()).toBe(id);
	});

	test("should throw if a transaction cannot be found by its ID", () => {
		expect(() => subject.transaction("unknown-hash")).toThrow("Transaction [unknown-hash] could not be found.");
	});

	test("should return all pending transactions", async () => {
		expect(subject.pending()).toEqual({});
		const id = await subject.signTransfer({
			signatory: {} as any,
			data: { amount: "1", to: "recipient-address" },
			gasLimit: BigNumber.make(1),
			gasPrice: BigNumber.make(1),
		});
		expect(subject.pending()).toEqual(
			expect.objectContaining({
				[id]: expect.anything(),
			}),
		);
	});

	test("should return all signed transactions", async () => {
		expect(subject.signed()).toEqual({});
		const id = await subject.signTransfer({
			signatory: {} as any,
			data: { amount: "1", to: "recipient-address" },
			gasLimit: BigNumber.make(1),
			gasPrice: BigNumber.make(1),
		});
		expect(subject.signed()).toEqual(
			expect.objectContaining({
				[id]: expect.anything(),
			}),
		);
	});

	test("should return all broadcasted transactions", () => {
		expect(subject.broadcasted()).toEqual({});
	});

	test("should check if a transaction has been signed", async () => {
		expect(subject.hasBeenSigned(TRANSACTION_HASH)).toBe(false);
		const id = await subject.signTransfer({
			signatory: {} as any,
			data: { amount: "1", to: "recipient-address" },
			gasLimit: BigNumber.make(1),
			gasPrice: BigNumber.make(1),
		});
		expect(subject.hasBeenSigned(id)).toBe(true);
	});

	test("should check if a transaction has been broadcasted", () => {
		expect(subject.hasBeenBroadcasted(TRANSACTION_HASH)).toBe(false);
	});

	test("should check if a transaction can be broadcasted", async () => {
		expect(subject.canBeBroadcasted(TRANSACTION_HASH)).toBe(false);
		const id = await subject.signTransfer({
			signatory: {} as any,
			data: { amount: "1", to: "recipient-address" },
			gasLimit: BigNumber.make(1),
			gasPrice: BigNumber.make(1),
		});
		expect(subject.canBeBroadcasted(id)).toBe(true);
	});

	test("should check if a transaction is awaiting confirmation", () => {
		expect(subject.isAwaitingConfirmation(TRANSACTION_HASH)).toBe(false);
	});
});
