import { describe, expect, it, vi } from "vitest";
import { IReadWriteWallet } from "./contracts.js";
import { WalletIdentifierFactory } from "./wallet.identifier.factory.js";

const createWalletMock = (
	methods: Partial<IReadWriteWallet>,
	networkConfig: { usesExtendedPublicKey: boolean } = { usesExtendedPublicKey: false },
) => {
	const wallet = {
		actsWithAddress: () => false,
		actsWithAddressWithDerivationPath: () => false,
		actsWithMnemonic: () => false,
		actsWithMnemonicWithEncryption: () => false,
		actsWithPublicKey: () => false,
		actsWithSecret: () => false,
		actsWithSecretWithEncryption: () => false,
		address: () => "address",
		derivationMethod: () => "bip39",
		importMethod: () => "bip39.mnemonic",
		network: () => ({
			usesExtendedPublicKey: () => networkConfig.usesExtendedPublicKey,
		}),
		publicKey: () => "publicKey",
		...methods,
	} as IReadWriteWallet;

	return wallet;
};

describe("WalletIdentifierFactory", () => {
	it("should return an address identifier for a wallet that acts with an address", () => {
		const wallet = createWalletMock({ actsWithAddress: () => true });
		const result = WalletIdentifierFactory.make(wallet);
		expect(result.type).toBe("address");
		expect(result.value).toBe("address");
	});

	it("should return an address identifier for a wallet that acts with address and derivation path", () => {
		const wallet = createWalletMock({ actsWithAddressWithDerivationPath: () => true });
		const result = WalletIdentifierFactory.make(wallet);
		expect(result.type).toBe("address");
		expect(result.value).toBe("address");
	});

	const addressOrPublicKeyMethods = [
		{ method: "actsWithMnemonic", name: "Mnemonic" },
		{ method: "actsWithPublicKey", name: "PublicKey" },
		{ method: "actsWithMnemonicWithEncryption", name: "MnemonicWithEncryption" },
		{ method: "actsWithSecret", name: "Secret" },
		{ method: "actsWithSecretWithEncryption", name: "SecretWithEncryption" },
	];

	for (const { name, method } of addressOrPublicKeyMethods) {
		it(`should return an address identifier for a ${name} wallet`, () => {
			const wallet = createWalletMock({ [method]: () => true });
			const result = WalletIdentifierFactory.make(wallet);
			expect(result.type).toBe("address");
			expect(result.value).toBe("address");
		});

		it(`should return an extended public key identifier for a ${name} wallet if the network uses it`, () => {
			const wallet = createWalletMock({ [method]: () => true }, { usesExtendedPublicKey: true });
			const result = WalletIdentifierFactory.make(wallet);
			expect(result.type).toBe("extendedPublicKey");
			expect(result.value).toBe("publicKey");
		});
	}

	it("should throw an error for an unsupported import method", () => {
		const wallet = createWalletMock({}); // All actsWith... methods are false by default
		expect(() => WalletIdentifierFactory.make(wallet)).toThrow("Unsupported import method bip39.mnemonic");
	});
});
