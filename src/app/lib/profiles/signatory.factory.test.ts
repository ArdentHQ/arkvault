import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { SignatoryFactory } from "./signatory.factory";
import { IReadWriteWallet } from "./contracts";

const createMockWallet = (overrides: Partial<IReadWriteWallet> = {}): IReadWriteWallet =>
	({
		actsWithBip44Mnemonic: vi.fn().mockReturnValue(false),
		actsWithBip44MnemonicWithEncryption: vi.fn().mockReturnValue(false),
		actsWithMnemonic: vi.fn().mockReturnValue(false),
		actsWithSecret: vi.fn().mockReturnValue(false),
		actsWithSecretWithEncryption: vi.fn().mockReturnValue(false),
		address: vi.fn().mockReturnValue("address"),
		confirmKey: vi.fn().mockReturnValue({ get: vi.fn().mockResolvedValue("confirm-key") }),
		data: vi.fn().mockReturnValue({ get: vi.fn().mockReturnValue("m/44'/1'/0'/0/0") }),
		isLedger: vi.fn().mockReturnValue(false),
		isSecondSignature: vi.fn().mockReturnValue(false),
		publicKey: vi.fn().mockReturnValue("public-key"),
		signatory: vi.fn().mockReturnValue({
			bip44Mnemonic: vi.fn().mockResolvedValue("bip44-signatory"),
			confirmationMnemonic: vi.fn().mockResolvedValue("confirmation-mnemonic-signatory"),
			confirmationSecret: vi.fn().mockResolvedValue("confirmation-secret-signatory"),
			ledger: vi.fn().mockResolvedValue("ledger-signatory"),
			mnemonic: vi.fn().mockResolvedValue("mnemonic-signatory"),
			secret: vi.fn().mockResolvedValue("secret-signatory"),
		}),
		signingKey: vi.fn().mockReturnValue({ get: vi.fn().mockResolvedValue("signing-key") }),
		...overrides,
	}) as any;

describe("SignatoryFactory", () => {
	let mockWallet: IReadWriteWallet;

	beforeEach(() => {
		mockWallet = createMockWallet();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("make", () => {
		it("should return confirmationMnemonic when mnemonic and secondMnemonic are provided", async () => {
			const factory = new SignatoryFactory(mockWallet);

			const result = await factory.make({
				mnemonic: "mnemonic",
				secondMnemonic: "secondMnemonic",
			});

			expect(mockWallet.signatory().confirmationMnemonic).toHaveBeenCalledWith("mnemonic", "secondMnemonic");
			expect(result).toBe("confirmation-mnemonic-signatory");
		});

		it("should return bip44Mnemonic when mnemonic and actsWithBip44Mnemonic is true", async () => {
			mockWallet = createMockWallet({
				actsWithBip44Mnemonic: vi.fn().mockReturnValue(true),
			});

			const factory = new SignatoryFactory(mockWallet);

			const result = await factory.make({ mnemonic: "mnemonic" });

			expect(mockWallet.signatory().bip44Mnemonic).toHaveBeenCalledWith("mnemonic", "m/44'/1'/0'/0/0");
			expect(result).toBe("bip44-signatory");
		});

		it("should throw TypeError when derivationPath is not a string for bip44Mnemonic", async () => {
			mockWallet = createMockWallet({
				actsWithBip44Mnemonic: vi.fn().mockReturnValue(true),
				data: vi.fn().mockReturnValue({ get: vi.fn().mockReturnValue(undefined) }),
			});

			const factory = new SignatoryFactory(mockWallet);

			await expect(factory.make({ mnemonic: "mnemonic" })).rejects.toThrow("[derivationPath] must be string.");
		});

		it("should return bip44Mnemonic when encryptionPassword and actsWithBip44MnemonicWithEncryption", async () => {
			mockWallet = createMockWallet({
				actsWithBip44MnemonicWithEncryption: vi.fn().mockReturnValue(true),
			});

			const factory = new SignatoryFactory(mockWallet);

			const result = await factory.make({ encryptionPassword: "password" });

			expect(mockWallet.signatory().bip44Mnemonic).toHaveBeenCalledWith("signing-key", "m/44'/1'/0'/0/0");
			expect(result).toBe("bip44-signatory");
		});

		it("should throw TypeError when derivationPath is not string for bip44MnemonicWithEncryption", async () => {
			mockWallet = createMockWallet({
				actsWithBip44MnemonicWithEncryption: vi.fn().mockReturnValue(true),
				data: vi.fn().mockReturnValue({ get: vi.fn().mockReturnValue(undefined) }),
			});

			const factory = new SignatoryFactory(mockWallet);

			await expect(factory.make({ encryptionPassword: "password" })).rejects.toThrow(
				"[derivationPath] must be string.",
			);
		});

		it("should return mnemonic when mnemonic is provided", async () => {
			const factory = new SignatoryFactory(mockWallet);

			const result = await factory.make({ mnemonic: "mnemonic" });

			expect(mockWallet.signatory().mnemonic).toHaveBeenCalledWith("mnemonic");
			expect(result).toBe("mnemonic-signatory");
		});

		it("should return confirmationSecret when encryptionPassword, isSecondSignature, and actsWithSecretWithEncryption", async () => {
			mockWallet = createMockWallet({
				actsWithSecretWithEncryption: vi.fn().mockReturnValue(true),
				isSecondSignature: vi.fn().mockReturnValue(true),
			});

			const factory = new SignatoryFactory(mockWallet);

			const result = await factory.make({ encryptionPassword: "password" });

			expect(mockWallet.signatory().confirmationSecret).toHaveBeenCalledWith("signing-key", "confirm-key");
			expect(result).toBe("confirmation-secret-signatory");
		});

		it("should return confirmationMnemonic when encryptionPassword, isSecondSignature, and not actsWithSecretWithEncryption", async () => {
			mockWallet = createMockWallet({
				actsWithSecretWithEncryption: vi.fn().mockReturnValue(false),
				isSecondSignature: vi.fn().mockReturnValue(true),
			});

			const factory = new SignatoryFactory(mockWallet);

			const result = await factory.make({ encryptionPassword: "password" });

			expect(mockWallet.signatory().confirmationMnemonic).toHaveBeenCalledWith("signing-key", "confirm-key");
			expect(result).toBe("confirmation-mnemonic-signatory");
		});

		it("should return secret when encryptionPassword and actsWithSecretWithEncryption", async () => {
			mockWallet = createMockWallet({
				actsWithSecretWithEncryption: vi.fn().mockReturnValue(true),
				isSecondSignature: vi.fn().mockReturnValue(false),
			});

			const factory = new SignatoryFactory(mockWallet);

			const result = await factory.make({ encryptionPassword: "password" });

			expect(mockWallet.signatory().secret).toHaveBeenCalledWith("signing-key");
			expect(result).toBe("secret-signatory");
		});

		it("should return mnemonic when encryptionPassword and not actsWithSecretWithEncryption", async () => {
			mockWallet = createMockWallet({
				actsWithSecretWithEncryption: vi.fn().mockReturnValue(false),
				isSecondSignature: vi.fn().mockReturnValue(false),
			});

			const factory = new SignatoryFactory(mockWallet);

			const result = await factory.make({ encryptionPassword: "password" });

			expect(mockWallet.signatory().mnemonic).toHaveBeenCalledWith("signing-key");
			expect(result).toBe("mnemonic-signatory");
		});

		it("should return ledger when isLedger", async () => {
			mockWallet = createMockWallet({
				isLedger: vi.fn().mockReturnValue(true),
			});

			const factory = new SignatoryFactory(mockWallet);

			const result = await factory.make({});

			expect(mockWallet.signatory().ledger).toHaveBeenCalledWith("m/44'/1'/0'/0/0", {
				address: "address",
				senderPublicKey: "public-key",
			});
			expect(result).toBe("ledger-signatory");
		});

		it("should throw TypeError when derivationPath is not string for ledger", async () => {
			mockWallet = createMockWallet({
				data: vi.fn().mockReturnValue({ get: vi.fn().mockReturnValue(undefined) }),
				isLedger: vi.fn().mockReturnValue(true),
			});

			const factory = new SignatoryFactory(mockWallet);

			await expect(factory.make({})).rejects.toThrow("[derivationPath] must be string.");
		});

		it("should return confirmationSecret when secret and secondSecret are provided", async () => {
			const factory = new SignatoryFactory(mockWallet);

			const result = await factory.make({
				secondSecret: "secondSecret",
				secret: "secret",
			});

			expect(mockWallet.signatory().confirmationSecret).toHaveBeenCalledWith("secret", "secondSecret");
			expect(result).toBe("confirmation-secret-signatory");
		});

		it("should return secret when secret is provided", async () => {
			const factory = new SignatoryFactory(mockWallet);

			const result = await factory.make({ secret: "secret" });

			expect(mockWallet.signatory().secret).toHaveBeenCalledWith("secret");
			expect(result).toBe("secret-signatory");
		});

		it("should throw error when no signing key is provided", async () => {
			const factory = new SignatoryFactory(mockWallet);

			await expect(factory.make({})).rejects.toThrow("No signing key provided.");
		});
	});

	describe("fromSigningKeys", () => {
		it("should call make with mnemonic when actsWithMnemonic", async () => {
			mockWallet = createMockWallet({
				actsWithMnemonic: vi.fn().mockReturnValue(true),
			});

			const factory = new SignatoryFactory(mockWallet);

			await factory.fromSigningKeys({ key: "mnemonic" });

			expect(mockWallet.signatory().mnemonic).toHaveBeenCalledWith("mnemonic");
		});

		it("should call make with secret when actsWithSecret", async () => {
			mockWallet = createMockWallet({
				actsWithSecret: vi.fn().mockReturnValue(true),
			});

			const factory = new SignatoryFactory(mockWallet);

			await factory.fromSigningKeys({ key: "secret" });

			expect(mockWallet.signatory().secret).toHaveBeenCalledWith("secret");
		});

		it("should call make with secondMnemonic when actsWithMnemonic and secondKey", async () => {
			mockWallet = createMockWallet({
				actsWithMnemonic: vi.fn().mockReturnValue(true),
			});

			const factory = new SignatoryFactory(mockWallet);

			await factory.fromSigningKeys({ key: "mnemonic", secondKey: "secondMnemonic" });

			expect(mockWallet.signatory().confirmationMnemonic).toHaveBeenCalledWith("mnemonic", "secondMnemonic");
		});

		it("should call make with secondSecret when actsWithSecret and secondKey", async () => {
			mockWallet = createMockWallet({
				actsWithSecret: vi.fn().mockReturnValue(true),
			});

			const factory = new SignatoryFactory(mockWallet);

			await factory.fromSigningKeys({ key: "secret", secondKey: "secondSecret" });

			expect(mockWallet.signatory().confirmationSecret).toHaveBeenCalledWith("secret", "secondSecret");
		});

		it("should pass encryptionPassword to make", async () => {
			mockWallet = createMockWallet({
				actsWithMnemonic: vi.fn().mockReturnValue(true),
			});

			const factory = new SignatoryFactory(mockWallet);

			await factory.fromSigningKeys({ encryptionPassword: "password", key: "mnemonic" });

			expect(mockWallet.signatory().mnemonic).toHaveBeenCalledWith("mnemonic");
		});
	});
});
