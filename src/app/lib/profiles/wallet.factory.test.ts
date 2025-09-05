import { describe, vi, expect, beforeEach, it, afterEach } from "vitest";
import { IProfile, IWalletFactory, WalletData, WalletFlag, WalletImportMethod } from "./contracts.js";
import { Wallet } from "./wallet.js";
import { env, MAINSAIL_MNEMONICS } from "@/utils/testing-library";
import { Enums } from "@/app/lib/mainsail";

let profile: IProfile;
let subject: IWalletFactory;
const mnemonic = MAINSAIL_MNEMONICS[0];
const password = "password";

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

		it("should generate a wallet with a public key", async () => {
			const { wallet } = await subject.generate({
				locale: "english",
				withPublicKey: true,
				wordCount: 12,
			});

			expect(wallet.data().get(WalletData.PublicKey)).toBeDefined();
		});
	});

	describe("fromMnemonicWithBIP39", () => {
		it("should create a wallet from a mnemonic", async () => {
			const wallet = await subject.fromMnemonicWithBIP39({ mnemonic });

			expect(wallet).toBeInstanceOf(Wallet);
			expect(wallet.address()).toBeTruthy();
			expect(wallet.data().get(WalletData.ImportMethod)).toBe(WalletImportMethod.BIP39.MNEMONIC);
			expect(wallet.data().get(WalletData.Status)).toBe(WalletFlag.Cold);
		});

		it("should create a wallet from a mnemonic with a password", async () => {
			const wallet = await subject.fromMnemonicWithBIP39({ mnemonic, password });

			expect(wallet).toBeInstanceOf(Wallet);
			expect(wallet.address()).toBeTruthy();
			expect(wallet.data().get(WalletData.ImportMethod)).toBe(WalletImportMethod.BIP39.MNEMONIC_WITH_ENCRYPTION);
		});

		it("should throw if the network uses extended public keys", async () => {
			const networkSpy = vi.spyOn(Wallet.prototype, "network").mockReturnValue({
				usesExtendedPublicKey: () => true,
			} as any);

			await expect(subject.fromMnemonicWithBIP39({ mnemonic })).rejects.toThrow(
				"The configured network uses extended public keys with BIP44 for derivation.",
			);

			networkSpy.mockRestore();
		});

		it("should throw if the network does not support BIP39", async () => {
			const gateSpy = vi.spyOn(Wallet.prototype, "gate").mockReturnValue({
				allows: () => false,
			} as any);

			const networkSpy = vi.spyOn(Wallet.prototype, "network").mockReturnValue({
				usesExtendedPublicKey: () => false,
			} as any);

			await expect(subject.fromMnemonicWithBIP39({ mnemonic })).rejects.toThrow(
				"The configured network does not support BIP39.",
			);

			gateSpy.mockRestore();
			networkSpy.mockRestore();
		});
	});

	describe("generateHD", () => {
		it("should generate an HD wallet with default coin type (ARK)", async () => {
			const { mnemonic, wallet } = await subject.generateHD({
				levels: { account: 0 },
				locale: "english",
				wordCount: 12,
			});

			expect(mnemonic).toBeTruthy();
			expect(wallet).toBeInstanceOf(Wallet);
			expect(wallet.address()).toBeTruthy();
			expect(wallet.data().get(WalletData.ImportMethod)).toBe(WalletImportMethod.BIP44.DERIVATION_PATH);
			expect(wallet.data().get(WalletData.DerivationPath)).toBe("m/44'/111'/0'/0/0");
			expect(wallet.data().get(WalletData.AddressIndex)).toBe(0);
		});

		it("should generate an HD wallet with ETH coin type", async () => {
			const { mnemonic, wallet } = await subject.generateHD({
				coin: "ETH",
				levels: { account: 0 },
				locale: "english",
				wordCount: 12,
			});

			expect(mnemonic.split(" ")).toHaveLength(12);
			expect(wallet).toBeInstanceOf(Wallet);
			expect(wallet.address()).toBeTruthy();
			expect(wallet.data().get(WalletData.DerivationPath)).toBe("m/44'/60'/0'/0/0");
		});

		it("should generate an HD wallet with custom account index", async () => {
			const { wallet } = await subject.generateHD({
				levels: { account: 5 },
				locale: "english",
				wordCount: 12,
			});

			expect(wallet.data().get(WalletData.DerivationPath)).toBe("m/44'/111'/5'/0/0");
			expect(wallet.data().get(WalletData.AddressIndex)).toBe(0);
		});

		it("should generate an HD wallet with custom change and address indices", async () => {
			const { wallet } = await subject.generateHD({
				levels: { account: 2, addressIndex: 3, change: 1 },
				locale: "english",
				wordCount: 12,
			});

			expect(wallet.data().get(WalletData.DerivationPath)).toBe("m/44'/111'/2'/1/3");
			expect(wallet.data().get(WalletData.AddressIndex)).toBe(3);
		});

		it("should generate an HD wallet with 24-word mnemonic", async () => {
			const { mnemonic, wallet } = await subject.generateHD({
				levels: { account: 0 },
				locale: "english",
				wordCount: 24,
			});

			expect(mnemonic.split(" ")).toHaveLength(24);
			expect(wallet).toBeInstanceOf(Wallet);
		});
	});

	describe("fromMnemonicWithBIP44", () => {
		it("should create a wallet from a mnemonic with default coin type", async () => {
			const wallet = await subject.fromMnemonicWithBIP44({
				levels: { account: 0 },
				mnemonic,
			});

			expect(wallet).toBeInstanceOf(Wallet);
			expect(wallet.address()).toBeTruthy();
			expect(wallet.data().get(WalletData.ImportMethod)).toBe(WalletImportMethod.BIP44.DERIVATION_PATH);
			expect(wallet.data().get(WalletData.DerivationPath)).toBe("m/44'/111'/0'/0/0");
			expect(wallet.data().get(WalletData.AddressIndex)).toBe(0);
			expect(wallet.data().get(WalletData.PublicKey)).toBeTruthy();
		});

		it("should create a wallet from a mnemonic with ETH coin type", async () => {
			const wallet = await subject.fromMnemonicWithBIP44({
				coin: "ETH",
				levels: { account: 0 },
				mnemonic,
			});

			expect(wallet).toBeInstanceOf(Wallet);
			expect(wallet.address()).toBeTruthy();
			expect(wallet.data().get(WalletData.DerivationPath)).toBe("m/44'/60'/0'/0/0");
		});

		it("should create a wallet with custom derivation levels", async () => {
			const wallet = await subject.fromMnemonicWithBIP44({
				levels: { account: 1, addressIndex: 5, change: 1 },
				mnemonic,
			});

			expect(wallet).toBeInstanceOf(Wallet);
			expect(wallet.address()).toBeTruthy();
			expect(wallet.data().get(WalletData.DerivationPath)).toBe("m/44'/111'/1'/1/5");
			expect(wallet.data().get(WalletData.AddressIndex)).toBe(5);
		});

		it("should use default change and address index when not provided", async () => {
			const wallet = await subject.fromMnemonicWithBIP44({
				levels: { account: 2 },
				mnemonic,
			});

			expect(wallet).toBeInstanceOf(Wallet);
			expect(wallet.data().get(WalletData.DerivationPath)).toBe("m/44'/111'/2'/0/0");
			expect(wallet.data().get(WalletData.AddressIndex)).toBe(0);
		});

		it("should generate different addresses for different derivation paths", async () => {
			const wallet1 = await subject.fromMnemonicWithBIP44({
				levels: { account: 0 },
				mnemonic,
			});

			const wallet2 = await subject.fromMnemonicWithBIP44({
				levels: { account: 1 },
				mnemonic,
			});

			expect(wallet1.address()).not.toBe(wallet2.address());
			expect(wallet1.data().get(WalletData.DerivationPath)).toBe("m/44'/111'/0'/0/0");
			expect(wallet2.data().get(WalletData.DerivationPath)).toBe("m/44'/111'/1'/0/0");
		});

		it("should generate different addresses for same mnemonic with different address indices", async () => {
			const wallet1 = await subject.fromMnemonicWithBIP44({
				levels: { account: 0, addressIndex: 0 },
				mnemonic,
			});

			const wallet2 = await subject.fromMnemonicWithBIP44({
				levels: { account: 0, addressIndex: 1 },
				mnemonic,
			});

			expect(wallet1.address()).not.toBe(wallet2.address());
			expect(wallet1.data().get(WalletData.DerivationPath)).toBe("m/44'/111'/0'/0/0");
			expect(wallet2.data().get(WalletData.DerivationPath)).toBe("m/44'/111'/0'/0/1");
		});

		it("should generate same address for same mnemonic and derivation path", async () => {
			const wallet1 = await subject.fromMnemonicWithBIP44({
				levels: { account: 1, addressIndex: 2, change: 0 },
				mnemonic,
			});

			const wallet2 = await subject.fromMnemonicWithBIP44({
				levels: { account: 1, addressIndex: 2, change: 0 },
				mnemonic,
			});

			expect(wallet1.address()).toBe(wallet2.address());
			expect(wallet1.data().get(WalletData.DerivationPath)).toBe("m/44'/111'/1'/0/2");
			expect(wallet2.data().get(WalletData.DerivationPath)).toBe("m/44'/111'/1'/0/2");
		});
	});

	describe("fromMnemonicWithBIP49", () => {
		it("should create a wallet from a mnemonic", async () => {
			const gateSpy = vi.spyOn(Wallet.prototype, "gate").mockReturnValue({
				allows: () => true,
			} as any);

			const wallet = await subject.fromMnemonicWithBIP49({ levels: { account: 0 }, mnemonic });

			expect(wallet).toBeInstanceOf(Wallet);
			expect(wallet.address()).toBeTruthy();
			// @TODO: relevant code is currently commented out in the wallet factory
			// expect(wallet.data().get(WalletData.ImportMethod)).toBe(WalletImportMethod.BIP49.MNEMONIC);
			expect(wallet.data().get(WalletData.Status)).toBe(WalletFlag.Cold);
			gateSpy.mockRestore();
		});

		it("should throw if the network does not support BIP49", async () => {
			const gateSpy = vi.spyOn(Wallet.prototype, "gate").mockReturnValue({
				allows: (feature: string) => feature !== Enums.FeatureFlag.AddressMnemonicBip49,
			} as any);

			await expect(subject.fromMnemonicWithBIP49({ levels: { account: 0 }, mnemonic })).rejects.toThrow(
				"The configured network does not support BIP49.",
			);

			gateSpy.mockRestore();
		});
	});

	describe("fromMnemonicWithBIP84", () => {
		it("should create a wallet from a mnemonic", async () => {
			const gateSpy = vi.spyOn(Wallet.prototype, "gate").mockReturnValue({
				allows: () => true,
			} as any);

			const wallet = await subject.fromMnemonicWithBIP84({ levels: { account: 0 }, mnemonic });

			expect(wallet).toBeInstanceOf(Wallet);
			expect(wallet.address()).toBeTruthy();
			// @TODO: relevant code is currently commented out in the wallet factory
			// expect(wallet.data().get(WalletData.ImportMethod)).toBe(WalletImportMethod.BIP84.MNEMONIC);
			expect(wallet.data().get(WalletData.Status)).toBe(WalletFlag.Cold);
			gateSpy.mockRestore();
		});

		it("should throw if the network does not support BIP84", async () => {
			const gateSpy = vi.spyOn(Wallet.prototype, "gate").mockReturnValue({
				allows: (feature: string) => feature !== Enums.FeatureFlag.AddressMnemonicBip84,
			} as any);

			await expect(subject.fromMnemonicWithBIP84({ levels: { account: 0 }, mnemonic })).rejects.toThrow(
				"The configured network does not support BIP84.",
			);

			gateSpy.mockRestore();
		});
	});

	describe("fromAddress", () => {
		it("should create a wallet from an address", async () => {
			const { wallet: tempWallet } = await subject.generate({
				locale: "english",
				wordCount: 12,
			});
			const address = tempWallet.address();

			const wallet = await subject.fromAddress({ address });
			expect(wallet).toBeInstanceOf(Wallet);
			expect(wallet.address()).toBe(address);
			expect(wallet.data().get(WalletData.ImportMethod)).toBe(WalletImportMethod.Address);
			expect(wallet.data().get(WalletData.Status)).toBe(WalletFlag.Cold);
		});
	});

	describe("fromPublicKey", () => {
		it("should create a wallet from a public key", async () => {
			const { wallet: tempWallet } = await subject.generate({
				locale: "english",
				withPublicKey: true,
				wordCount: 12,
			});
			const publicKey = tempWallet.publicKey();

			const wallet = await subject.fromPublicKey({ publicKey: publicKey! });
			expect(wallet).toBeInstanceOf(Wallet);
			expect(wallet.publicKey()).toBe(publicKey);
			expect(wallet.address()).toBeTruthy();
			expect(wallet.data().get(WalletData.ImportMethod)).toBe(WalletImportMethod.PublicKey);
			expect(wallet.data().get(WalletData.Status)).toBe(WalletFlag.Cold);
		});
	});

	describe("fromPrivateKey", () => {
		it("should create a wallet from a private key", async () => {
			const wallet = await subject.fromPrivateKey({
				privateKey: "cbf4b9f70470856bb4f40f80b87edb90865997ffee6df315ab166d713af433a5",
			});
			expect(wallet).toBeInstanceOf(Wallet);
			expect(wallet.address()).toBeTruthy();
			expect(wallet.data().get(WalletData.ImportMethod)).toBe(WalletImportMethod.PrivateKey);
			expect(wallet.data().get(WalletData.Status)).toBe(WalletFlag.Cold);
		});
	});

	describe("fromAddressWithDerivationPath", () => {
		it("should create a wallet from an address with a BIP44 derivation path", async () => {
			const { wallet: tempWallet } = await subject.generate({
				locale: "english",
				wordCount: 12,
			});
			const address = tempWallet.address();
			const path = "m/44'/0'/0'/0/0";

			const wallet = await subject.fromAddressWithDerivationPath({ address, path });
			expect(wallet).toBeInstanceOf(Wallet);
			expect(wallet.address()).toBe(address);
			expect(wallet.data().get(WalletData.DerivationPath)).toBe(path);
			expect(wallet.data().get(WalletData.ImportMethod)).toBe(WalletImportMethod.BIP44.DERIVATION_PATH);
			expect(wallet.data().get(WalletData.Status)).toBe(WalletFlag.Cold);
		});

		it("should create a wallet from an address with a BIP49 derivation path", async () => {
			const { wallet: tempWallet } = await subject.generate({
				locale: "english",
				wordCount: 12,
			});
			const address = tempWallet.address();
			const path = "m/49'/0'/0'/0/0";

			const wallet = await subject.fromAddressWithDerivationPath({ address, path });
			expect(wallet).toBeInstanceOf(Wallet);
			expect(wallet.address()).toBe(address);
			expect(wallet.data().get(WalletData.DerivationPath)).toBe(path);
			expect(wallet.data().get(WalletData.ImportMethod)).toBe(WalletImportMethod.BIP49.DERIVATION_PATH);
			expect(wallet.data().get(WalletData.Status)).toBe(WalletFlag.Cold);
		});

		it("should create a wallet from an address with a BIP84 derivation path", async () => {
			const { wallet: tempWallet } = await subject.generate({
				locale: "english",
				wordCount: 12,
			});
			const address = tempWallet.address();
			const path = "m/84'/0'/0'/0/0";

			const wallet = await subject.fromAddressWithDerivationPath({ address, path });
			expect(wallet).toBeInstanceOf(Wallet);
			expect(wallet.address()).toBe(address);
			expect(wallet.data().get(WalletData.DerivationPath)).toBe(path);
			expect(wallet.data().get(WalletData.ImportMethod)).toBe(WalletImportMethod.BIP84.DERIVATION_PATH);
			expect(wallet.data().get(WalletData.Status)).toBe(WalletFlag.Cold);
		});
	});

	describe("fromSecret", () => {
		it("should create a wallet from a secret", async () => {
			const wallet = await subject.fromSecret({ secret: "a secret" });
			expect(wallet).toBeInstanceOf(Wallet);
			expect(wallet.address()).toBeTruthy();
			expect(wallet.data().get(WalletData.ImportMethod)).toBe(WalletImportMethod.SECRET);
			expect(wallet.data().get(WalletData.Status)).toBe(WalletFlag.Cold);
		});

		it("should create a wallet from a secret with a password", async () => {
			const wallet = await subject.fromSecret({ password, secret: "a secret" });
			expect(wallet).toBeInstanceOf(Wallet);
			expect(wallet.address()).toBeTruthy();
			expect(wallet.data().get(WalletData.ImportMethod)).toBe(WalletImportMethod.SECRET_WITH_ENCRYPTION);
		});
	});
});
