import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { IProfile, IReadWriteWallet } from "./contracts";
import { env, MAINSAIL_MNEMONICS } from "@/utils/testing-library";
import { TransactionService } from "./wallet-transaction.service";

let profile: IProfile;
let wallet: IReadWriteWallet;
let subject: TransactionService;

beforeEach(async () => {
	profile = await env.profiles().create("test profile");

	wallet = await profile.walletFactory().fromMnemonicWithBIP39({
		mnemonic: MAINSAIL_MNEMONICS[0],
	});

	subject = new TransactionService(wallet);
});

describe("TransactionService", () => {
	it("should instantiate the service", () => {
		expect(subject).toBeDefined();
	});
});
