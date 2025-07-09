import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { IProfile, IReadWriteWallet } from "./contracts.js";
import { WalletIdentifierFactory } from "./wallet.identifier.factory.js";
import { env, MAINSAIL_MNEMONICS } from "@/utils/testing-library";

let profile: IProfile;
let wallet: IReadWriteWallet;

describe("WalletIdentifierFactory", () => {
	beforeEach(async () => {
		profile = await env.profiles().create("test profile");
		wallet = await profile.walletFactory().fromMnemonicWithBIP39({
			mnemonic: MAINSAIL_MNEMONICS[0],
		});
	});

	afterEach(() => {
		env.profiles().forget(profile.id());
		vi.restoreAllMocks();
	});

	it("should return an address identifier for a wallet that acts with an address", () => {
		vi.spyOn(wallet, "actsWithAddress").mockReturnValue(true);
		const result = WalletIdentifierFactory.make(wallet);
		expect(result.type).toBe("address");
		expect(result.value).toBe(wallet.address());
	});

	it("should return an address identifier for a wallet that acts with address and derivation path", () => {
		vi.spyOn(wallet, "actsWithAddressWithDerivationPath").mockReturnValue(true);
		const result = WalletIdentifierFactory.make(wallet);
		expect(result.type).toBe("address");
		expect(result.value).toBe(wallet.address());
	});

	const addressOrPublicKeyMethods = [
		{ importMethod: "bip39.mnemonic", name: "Mnemonic" },
		{ importMethod: "publicKey", name: "PublicKey" },
		{
			importMethod: "bip39.mnemonic.bip38",
			name: "MnemonicWithEncryption",
		},
		{ importMethod: "secret", name: "Secret" },
		{ importMethod: "secret.bip38", name: "SecretWithEncryption" },
	] as const;

	for (const { name, importMethod } of addressOrPublicKeyMethods) {
		it(`should return an address identifier for a ${name} wallet`, () => {
			vi.spyOn(wallet, "importMethod").mockReturnValue(importMethod);
			const result = WalletIdentifierFactory.make(wallet);
			expect(result.type).toBe("address");
			expect(result.value).toBe(wallet.address());
		});

		it(`should return an extended public key identifier for a ${name} wallet if the network uses it`, () => {
			vi.spyOn(wallet, "importMethod").mockReturnValue(importMethod);
			vi.spyOn(wallet, "network").mockReturnValue({
				usesExtendedPublicKey: () => true,
			} as any);
			vi.spyOn(wallet, "publicKey").mockReturnValue("mock-public-key");

			const result = WalletIdentifierFactory.make(wallet);
			expect(result.type).toBe("extendedPublicKey");
			expect(result.value).toBe("mock-public-key");
		});
	}

	it("should throw an error for an unsupported import method", () => {
		vi.spyOn(wallet, "actsWithAddress").mockReturnValue(false);
		vi.spyOn(wallet, "actsWithAddressWithDerivationPath").mockReturnValue(false);
		vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);
		vi.spyOn(wallet, "actsWithMnemonicWithEncryption").mockReturnValue(false);
		vi.spyOn(wallet, "actsWithPublicKey").mockReturnValue(false);
		vi.spyOn(wallet, "actsWithSecret").mockReturnValue(false);
		vi.spyOn(wallet, "actsWithSecretWithEncryption").mockReturnValue(false);

		vi.spyOn(wallet, "importMethod").mockReturnValue("unsupported.method");
		expect(() => WalletIdentifierFactory.make(wallet)).toThrow("Unsupported import method unsupported.method");
	});
});
