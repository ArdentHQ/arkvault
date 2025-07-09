import { describe, vi, expect, beforeEach, it, afterEach } from "vitest";
import { IProfile, IWalletFactory } from "./contracts.js";
import { Wallet } from "./wallet.js";
import { env } from "@/utils/testing-library";

let profile: IProfile;
let subject: IWalletFactory;

describe("WalletFactory", () => {
	beforeEach(async () => {
		profile = await env.profiles().create("test profile");
		subject = profile.walletFactory();
	});

	afterEach(() => {
		env.profiles().forget(profile.id());
		vi.restoreAllMocks();
	});

	describe("generate", () => {
		it("should generate a wallet", async () => {
			const { mnemonic, wallet } = await subject.generate({
				locale: "english",
				wordCount: 12,
			});

			expect(mnemonic.split(" ")).toHaveLength(12);
			expect(wallet).toBeInstanceOf(Wallet);
		});
	});
});
