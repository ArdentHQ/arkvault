import { describe, vi, expect, beforeEach, afterEach, it } from "vitest";
import { BigNumber } from "@/app/lib/helpers";
import { IReadWriteWallet, WalletData } from "./contracts";
import { Services } from "@/app/lib/mainsail";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { TransactionService } from "./wallet-transaction.service";
import { IProfile } from "./profile.contract";
import { env, MAINSAIL_MNEMONICS } from "@/utils/testing-library";
import { ExtendedSignedTransactionData } from "./signed-transaction.dto";

const mockTransactionMethod = vi.fn().mockResolvedValue(TransactionFixture);

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

const DUMMY_TRANSFER_INPUT: Services.TransferInput = {
	data: { amount: "1", to: "recipient-address" },
	gasLimit: BigNumber.make(1),
	gasPrice: BigNumber.make(1),
	signatory: {} as any,
};

const mockClient = {
	broadcast: vi.fn().mockResolvedValue({ accepted: [TransactionFixture.hash()], errors: {}, rejected: [] }),
	transaction: vi.fn().mockResolvedValue({ ...TransactionFixture, isConfirmed: () => true }),
};

let profile: IProfile;
let wallet: IReadWriteWallet;

describe("TransactionService", () => {
	let subject: TransactionService;

	beforeEach(async () => {
		vi.clearAllMocks();

		profile = await env.profiles().create("test profile");

		wallet = await profile.walletFactory().fromMnemonicWithBIP39({
			mnemonic: MAINSAIL_MNEMONICS[0],
		});

		vi.spyOn(wallet, "client").mockImplementation(() => mockClient);

		vi.spyOn(wallet, "transaction").mockReturnValue({
			broadcast: vi.fn(),
			confirm: vi.fn(),
			dump: vi.fn(),
		});

		vi.spyOn(wallet, "transactionService").mockImplementation(() => mockMainsailTransactionService);

		vi.spyOn(wallet.signingKey(), "get").mockReturnValue("secret");

		const restoreSpy = vi.spyOn(TransactionService.prototype, "restore").mockImplementation(() => {});
		subject = new TransactionService(wallet);
		restoreSpy.mockRestore();
	});

	afterEach(() => {
		env.profiles().forget(profile.id());

		vi.clearAllMocks();
	});

	it("should sign a transfer", async () => {
		const result = await subject.signTransfer(DUMMY_TRANSFER_INPUT);
		expect(result).toBe(TransactionFixture.hash());
		expect(mockTransactionMethod).toHaveBeenCalledWith(DUMMY_TRANSFER_INPUT);
	});

	it("should sign a second signature", async () => {
		const input: Services.SecondSignatureInput = {
			data: { mnemonic: "a mnemonic" },
			signatory: {} as any,
		};
		const result = await subject.signSecondSignature(input);
		expect(result).toBe(TransactionFixture.hash());
		expect(mockTransactionMethod).toHaveBeenCalledWith(input);
	});

	it("should sign a username registration", async () => {
		const input: Services.UsernameRegistrationInput = {
			data: { username: "test-user" },
			signatory: {} as any,
		};
		const result = await subject.signUsernameRegistration(input);
		expect(result).toBe(TransactionFixture.hash());
		expect(mockTransactionMethod).toHaveBeenCalledWith(input);
	});

	it("should sign a username resignation", async () => {
		const input: Services.UsernameResignationInput = { signatory: {} as any };
		const result = await subject.signUsernameResignation(input);
		expect(result).toBe(TransactionFixture.hash());
		expect(mockTransactionMethod).toHaveBeenCalledWith(input);
	});

	it("should sign a delegate registration", async () => {
		const input: Services.ValidatorRegistrationInput = {
			data: { validatorPublicKey: "validator-public-key", value: 100 },
			signatory: {} as any,
		};
		const result = await subject.signDelegateRegistration(input);
		expect(result).toBe(TransactionFixture.hash());
		expect(mockTransactionMethod).toHaveBeenCalledWith(input);
	});

	it("should sign a validator registration", async () => {
		const input: Services.ValidatorRegistrationInput = {
			data: { validatorPublicKey: "validator-public-key", value: 100 },
			signatory: {} as any,
		};
		const result = await subject.signValidatorRegistration(input);
		expect(result).toBe(TransactionFixture.hash());
		expect(mockTransactionMethod).toHaveBeenCalledWith(input);
	});

	it("should sign a vote", async () => {
		const input: Services.VoteInput = {
			data: { votes: [{ amount: 0, id: "vote-id" }] },
			signatory: {} as any,
		};
		const result = await subject.signVote(input);
		expect(result).toBe(TransactionFixture.hash());
		expect(mockTransactionMethod).toHaveBeenCalledWith(input);
	});

	it("should sign a multi-payment", async () => {
		const input: Services.MultiPaymentInput = {
			data: { payments: [{ amount: 10, to: "address-1" }] },
			signatory: {} as any,
		};
		const result = await subject.signMultiPayment(input);
		expect(result).toBe(TransactionFixture.hash());
		expect(mockTransactionMethod).toHaveBeenCalledWith(input);
	});

	it("should sign a delegate resignation", async () => {
		const input: Services.ValidatorResignationInput = { signatory: {} as any };
		const result = await subject.signDelegateResignation(input);
		expect(result).toBe(TransactionFixture.hash());
		expect(mockTransactionMethod).toHaveBeenCalledWith(input);
	});

	it("should sign a validator resignation", async () => {
		const input: Services.ValidatorResignationInput = { signatory: {} as any };
		const result = await subject.signValidatorResignation(input);
		expect(result).toBe(TransactionFixture.hash());
		expect(mockTransactionMethod).toHaveBeenCalledWith(input);
	});

	it("should sign an update validator transaction", async () => {
		const input: Services.UpdateValidatorInput = {
			data: { validatorPublicKey: "new-public-key" },
			signatory: {} as any,
		};
		const result = await subject.signUpdateValidator(input);
		expect(result).toBe(TransactionFixture.hash());
		expect(mockTransactionMethod).toHaveBeenCalledWith(input);
	});

	it("should find a transaction by its ID", async () => {
		const id = await subject.signTransfer(DUMMY_TRANSFER_INPUT);
		const result = subject.transaction(id);
		expect(result.hash()).toBe(id);
	});

	it("should throw when failing to find a transaction by its ID", () => {
		expect(() => subject.transaction("unknown-id")).toThrow("Transaction [unknown-id] could not be found.");
	});

	it("should throw for a malformed ID", () => {
		// @ts-expect-error - We are intentionally passing an invalid type.
		expect(() => subject.transaction(undefined)).toThrow("Encountered a malformed ID. This looks like a bug.");
	});

	it("should broadcast a transaction", async () => {
		const id = await subject.signTransfer(DUMMY_TRANSFER_INPUT);
		await subject.broadcast(id);
		expect(mockClient.broadcast).toHaveBeenCalled();
	});

	it("should confirm a transaction", async () => {
		const id = await subject.signTransfer(DUMMY_TRANSFER_INPUT);
		await subject.broadcast(id);
		const response = await subject.confirm(id);

		expect(response).toBe(true);
	});

	it("should return false if confirming the transaction fails on the client", async () => {
		const id = await subject.signTransfer(DUMMY_TRANSFER_INPUT);
		await subject.broadcast(id);

		const clientSpy = vi.spyOn(wallet, "client").mockImplementation(() => ({
			...mockClient,
			transaction: vi.fn().mockRejectedValue(new Error("Failed")),
		}));

		await expect(subject.confirm(id)).resolves.toBe(false);

		clientSpy.mockRestore();
	});

	it("should throw when trying to confirm a transaction that is not awaiting confirmation", async () => {
		const id = await subject.signTransfer(DUMMY_TRANSFER_INPUT);
		await subject.broadcast(id);

		// Confirm it once, which should succeed.
		await subject.confirm(id);

		// Now that it is confirmed, it is no longer awaiting confirmation.
		await expect(subject.confirm(id)).rejects.toThrow(`Transaction [${id}] is not awaiting confirmation.`);
	});

	it("should return all pending transactions", async () => {
		expect(subject.pending()).toEqual({});
		const id = await subject.signTransfer(DUMMY_TRANSFER_INPUT);
		expect(subject.pending()).toEqual(
			expect.objectContaining({
				[id]: expect.anything(),
			}),
		);
	});

	it("should return all signed transactions", async () => {
		expect(subject.signed()).toEqual({});
		const id = await subject.signTransfer(DUMMY_TRANSFER_INPUT);
		expect(subject.signed()).toEqual(
			expect.objectContaining({
				[id]: expect.anything(),
			}),
		);
	});

	it("should return all broadcasted transactions", () => {
		expect(subject.broadcasted()).toEqual({});
	});

	it("should check if a transaction has been signed", async () => {
		expect(subject.hasBeenSigned(TransactionFixture.hash())).toBe(false);
		const id = await subject.signTransfer(DUMMY_TRANSFER_INPUT);
		expect(subject.hasBeenSigned(id)).toBe(true);
	});

	it("should check if a transaction has been confirmed", () => {
		expect(subject.hasBeenConfirmed(TransactionFixture.hash())).toBe(false);
	});

	it("should check if a transaction has been broadcasted", () => {
		expect(subject.hasBeenBroadcasted(TransactionFixture.hash())).toBe(false);
	});

	it("should check if a transaction can be broadcasted", async () => {
		expect(subject.canBeBroadcasted(TransactionFixture.hash())).toBe(false);
		const id = await subject.signTransfer(DUMMY_TRANSFER_INPUT);
		expect(subject.canBeBroadcasted(id)).toBe(true);
	});

	it("should check if a transaction is awaiting confirmation", () => {
		expect(subject.isAwaitingConfirmation(TransactionFixture.hash())).toBe(false);
	});

	it("should throw when calling #sync", () => {
		expect(() => subject.sync()).toThrow("Method TransactionService#sync is not implemented.");
	});

	it("should throw when calling #addSignature", () => {
		expect(() => subject.addSignature()).toThrow("Method TransactionService#addSignature is not implemented.");
	});

	it("should return false for #canBeSigned", () => {
		expect(subject.canBeSigned()).toBe(false);
	});

	it("should dump the transactions", async () => {
		// Test initial empty state
		subject.dump();
		expect(wallet.data().get(WalletData.SignedTransactions)).toEqual({});
		expect(wallet.data().get(WalletData.BroadcastedTransactions)).toEqual({});
		expect(wallet.data().get(WalletData.PendingMultiSignatures)).toEqual({});

		// Sign a transaction and dump
		const id = await subject.signTransfer(DUMMY_TRANSFER_INPUT);
		subject.dump();

		// Verify signed transaction is dumped
		const signed = wallet.data().get(WalletData.SignedTransactions) as Record<string, any>;
		expect(Object.keys(signed)).toContain(id);
		expect(signed[id].hash()).toBe(id);
		expect(wallet.data().get(WalletData.BroadcastedTransactions)).toEqual({});

		// Broadcast the transaction and dump again
		await subject.broadcast(id);
		subject.dump();

		// Verify broadcasted transaction is dumped
		const broadcasted = wallet.data().get(WalletData.BroadcastedTransactions) as Record<string, any>;
		expect(Object.keys(broadcasted)).toContain(id);
		expect(broadcasted[id].hash()).toBe(id);
	});

	it("should restore dumped transactions", async () => {
		const id = await subject.signTransfer(DUMMY_TRANSFER_INPUT);
		subject.dump();

		// Create a new service instance, which will call `restore()` in the constructor
		const newSubject = new TransactionService(wallet);

		expect(newSubject.hasBeenSigned(id)).toBe(true);

		const restoredTransaction = newSubject.transaction(id);
		expect(restoredTransaction).toBeInstanceOf(ExtendedSignedTransactionData);
		expect(typeof restoredTransaction.toBroadcast).toBe("function");
	});
});
