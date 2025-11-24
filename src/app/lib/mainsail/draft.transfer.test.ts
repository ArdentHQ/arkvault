import { describe, it, expect, beforeEach } from "vitest";
import { DraftTransfer } from "./draft-transfer";
import { env, getMainsailProfileId, MAINSAIL_MNEMONICS } from "@/utils/testing-library";
import { Contracts } from "@/app/lib/profiles";
import { ExtendedSignedTransactionData } from "@/app/lib/profiles/signed-transaction.dto";

describe("DraftTransfer", () => {
	let draftTransfer: DraftTransfer;
	let profile: Contracts.IProfile;

	beforeEach(() => {
		profile = env.profiles().findById(getMainsailProfileId());
		draftTransfer = profile.draftTransactionFactory().transfer();
	});

	it("should initialize with empty state", () => {
		expect(draftTransfer.recipientWallets()).toEqual([]);
		expect(draftTransfer.amount()).toBe(0);
		expect(draftTransfer.memo()).toBeUndefined();
		expect(draftTransfer.fees()).toBeUndefined();
		expect(draftTransfer.gasLimit()).toBeUndefined();
		expect(draftTransfer.selectedFee()).toBeUndefined();
		expect(draftTransfer.signedTransaction()).toBeUndefined();
	});

	it("should add recipient wallet", () => {
		const wallet = profile.wallets().first();
		draftTransfer.addRecipientWallet(wallet);

		expect(draftTransfer.recipientWallets()).toContain(wallet);
		expect(draftTransfer.recipient()).toBe(wallet);
	});

	it("should add multiple recipient wallets", () => {
		const wallets = profile.wallets().values();
		draftTransfer.addRecipientWallets(wallets);

		expect(draftTransfer.recipientWallets()).toEqual(wallets);
		expect(draftTransfer.recipientWallets()).toHaveLength(profile.wallets().count());
	});

	it("should return first recipient when recipient() is called", () => {
		const firstWallet = profile.wallets().first();
		const secondWallet = profile.wallets().last();

		draftTransfer.addRecipientWallet(firstWallet);
		draftTransfer.addRecipientWallet(secondWallet);

		expect(draftTransfer.recipient()).toBe(firstWallet);
	});

	it("should set sender wallet", () => {
		const wallet = profile.wallets().first();
		draftTransfer.setSender(wallet);

		expect(() => draftTransfer.sender()).not.toThrow();
		expect(draftTransfer.sender()).toBe(wallet);
	});

	it("should set amount", () => {
		draftTransfer.setAmount(100);
		expect(draftTransfer.amount()).toBe(100);
	});

	it("should set memo", () => {
		draftTransfer.setMemo("test memo");
		expect(draftTransfer.memo()).toBe("test memo");
	});

	it("should select fee type", async () => {
		draftTransfer.setSender(profile.wallets().first());
		draftTransfer.addRecipientWallet(profile.wallets().first());
		expect(draftTransfer.selectedFee()).toBeUndefined();

		await draftTransfer.calculateFees();
		expect(draftTransfer.fees()?.min.toString()).toBe("5");
		expect(draftTransfer.fees()?.avg.toString()).toBe("5.06670125");
		expect(draftTransfer.fees()?.max.toString()).toBe("6");

		draftTransfer.selectFee("max");
		expect(draftTransfer.selectedFee()?.toString()).toBe("6");
	});

	it("should reset all state", () => {
		draftTransfer.setSender(profile.wallets().first());
		draftTransfer.addRecipientWallet(profile.wallets().last());
		draftTransfer.setAmount(100);
		draftTransfer.setMemo("test");
		draftTransfer.selectFee("avg");

		draftTransfer.reset();

		expect(draftTransfer.recipientWallets()).toEqual([]);
		expect(draftTransfer.amount()).toBe(0);
		expect(draftTransfer.memo()).toBeUndefined();
		expect(draftTransfer.fees()).toBeUndefined();
		expect(draftTransfer.gasLimit()).toBeUndefined();
		expect(draftTransfer.selectedFee()).toBeUndefined();
		expect(draftTransfer.signedTransaction()).toBeUndefined();
	});

	it("should throw error when sender is called but not set", () => {
		expect(() => draftTransfer.sender()).toThrow();
	});

	it("should return undefined for recipient when no recipients are set", () => {
		expect(draftTransfer.recipient()).toBeUndefined();
	});

	it("should return empty array when no recipients are set", () => {
		expect(draftTransfer.recipientWallets()).toEqual([]);
	});

	it("should return network from sender wallet", () => {
		draftTransfer.setSender(profile.wallets().first());

		expect(draftTransfer.network()).toBe(profile.wallets().first().network());
	});

	it("should return undefined confirmation time when network is not available", async () => {
		draftTransfer.setSender(profile.wallets().first());
		draftTransfer.addRecipientWallet(profile.wallets().first());

		await draftTransfer.calculateFees();

		expect(draftTransfer.confirmationTime("avg")).toBe(8);
	});

	it("should return undefined for selected fee when fees are not calculated", () => {
		draftTransfer.selectFee("avg");
		expect(draftTransfer.selectedFee()).toBeUndefined();
	});

	it("should not mark as complete if transaction is not signed", () => {
		expect(draftTransfer.isCompleted()).toBe(false);
	});

	it("should not mark as pending if transaction is not signed", () => {
		expect(draftTransfer.isPending()).toBe(false);
	});

	it("should throw when signing and recipient is not set", async () => {
		draftTransfer.setSender(profile.wallets().first());
		draftTransfer.setAmount(100);
		draftTransfer.selectFee("avg");

		await expect(draftTransfer.sign()).rejects.toThrow();
	});

	it("should throw when siging and amount is not set", async () => {
		draftTransfer.setSender(profile.wallets().first());
		draftTransfer.addRecipientWallet(profile.wallets().first());

		await expect(draftTransfer.sign()).rejects.toThrow();
	});

	it("should sign transaction and return signed transaction", async () => {
		draftTransfer.setSender(profile.wallets().first());
		draftTransfer.addRecipientWallet(profile.wallets().first());
		draftTransfer.setAmount(100);
		draftTransfer.selectFee("avg");
		await draftTransfer.calculateFees();

		const signedTransaction = await draftTransfer.sign({ key: MAINSAIL_MNEMONICS[0] });
		expect(signedTransaction).toBeInstanceOf(ExtendedSignedTransactionData);
		expect(signedTransaction.hash()).toBe("d5bfff1a73508756f0cca47dfa514db8940b626322b87fec65489c1fecd344bf");
	});

	it("should broadcast", async () => {
		draftTransfer.setSender(profile.wallets().first());
		draftTransfer.addRecipientWallet(profile.wallets().first());
		draftTransfer.setAmount(100);
		draftTransfer.selectFee("avg");
		await draftTransfer.calculateFees();

		const signedTransaction = await draftTransfer.sign({ key: MAINSAIL_MNEMONICS[0] });
		vi.spyOn(profile.wallets().first().transaction(), "broadcast").mockResolvedValue({
			accepted: [signedTransaction.hash()],
			errors: {},
			rejected: [],
		});

		const transaction = await draftTransfer.broadcast(signedTransaction);
		expect(transaction).toBeInstanceOf(ExtendedSignedTransactionData);
	});
});
