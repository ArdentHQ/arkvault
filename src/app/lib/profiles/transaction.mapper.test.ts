import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { IProfile, IReadWriteWallet } from "./contracts.js";
import { env, MAINSAIL_MNEMONICS } from "@/utils/testing-library";
import { transformTransactionData, transformConfirmedTransactionDataCollection } from "./transaction.mapper";
import { ExtendedConfirmedTransactionData } from "./transaction.dto";
import { ConfirmedTransactionData } from "@/app/lib/mainsail/confirmed-transaction.dto.js";
import { ExtendedConfirmedTransactionDataCollection } from "./transaction.collection.js";

let profile: IProfile;
let wallet: IReadWriteWallet;

beforeEach(async () => {
	profile = await env.profiles().create("test profile");
	wallet = await profile.walletFactory().fromMnemonicWithBIP39({ mnemonic: MAINSAIL_MNEMONICS[0] });
});

afterEach(() => {
	env.profiles().forget(profile.id());
});

describe("transformTransactionData", () => {
	it("should transform a transaction", () => {
		const transaction = {} as ConfirmedTransactionData;
		const result = transformTransactionData(wallet, transaction);
		expect(result).toBeInstanceOf(ExtendedConfirmedTransactionData);
		expect(result.wallet()).toEqual(wallet);
	});
});

describe("transformConfirmedTransactionDataCollection", () => {
	it("should transform a collection of transactions", async () => {
		const transactionMock = { normalizeData: vi.fn() };
		const transactions = {
			getPagination: () => ({ next: "https://next-page.com" }),
			items: () => [transactionMock],
		} as any;

		const result = await transformConfirmedTransactionDataCollection(wallet, transactions);

		expect(transactionMock.normalizeData).toHaveBeenCalled();
		expect(result).toBeInstanceOf(ExtendedConfirmedTransactionDataCollection);
		expect(result.items()).toHaveLength(1);
		expect(result.items()[0]).toBeInstanceOf(ExtendedConfirmedTransactionData);
		expect(result.hasMorePages()).toBe(true);
	});
});
