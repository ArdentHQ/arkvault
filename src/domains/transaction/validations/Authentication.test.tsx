import { BIP39 } from "@ardenthq/arkvault-crypto";
import { Contracts } from "@ardenthq/sdk-profiles";

import { authentication } from "./Authentication";
import { env, MNEMONICS } from "@/utils/testing-library";

let translationMock: any;
let wallet: Contracts.IReadWriteWallet;
let walletWithPassword: Contracts.IReadWriteWallet;

import { AddressService } from "@/app/lib/mainsail/address.service";

vi.mock("@/utils/debounce", () => ({
	debounceAsync: (promise: Promise<any>) => promise,
}));

describe("Authentication", () => {
	beforeAll(async () => {
		translationMock = vi.fn((index18nString: string) => index18nString);

		const profile = env.profiles().first();
		await env.profiles().restore(profile);
		await profile.sync();

		wallet = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "Mainsail",
			mnemonic: MNEMONICS[0],
			network: "mainsail.devnet",
		});

		walletWithPassword = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "Mainsail",
			mnemonic: MNEMONICS[1],
			network: "mainsail.devnet",
			password: "password",
		});

		env.profiles().first().wallets().push(wallet);
		env.profiles().first().wallets().push(walletWithPassword);

		await wallet.synchroniser().identity();
		await walletWithPassword.synchroniser().identity();
	});

	it("should validate mnemonic", async () => {
		const fromMnemonicMock = vi
			.spyOn(AddressService.prototype, "fromMnemonic")
			.mockReturnValue({ address: wallet.address(), type: "bip39" });

		const mnemonic = authentication(translationMock).mnemonic(wallet);

		await expect(mnemonic.validate.matchSenderAddress(MNEMONICS[0])).toBe(true);

		fromMnemonicMock.mockRestore();
	});

	it("should fail mnemonic validation", async () => {
		const mnemonic = authentication(translationMock).mnemonic(wallet);

		await expect(mnemonic.validate.matchSenderAddress(MNEMONICS[1])).toBe(
			"COMMON.INPUT_PASSPHRASE.VALIDATION.MNEMONIC_NOT_MATCH_WALLET",
		);
	});

	it("should fail mnemonic validation for invalid mnemonic", async () => {
		const fromMnemonicMock = vi.spyOn(AddressService.prototype, "fromMnemonic").mockImplementation(() => {
			throw new Error("invalid");
		});

		const mnemonic = authentication(translationMock).mnemonic(wallet);

		await expect(mnemonic.validate.matchSenderAddress("invalid mnemonic")).toBe(
			"COMMON.INPUT_PASSPHRASE.VALIDATION.MNEMONIC_NOT_MATCH_WALLET",
		);

		fromMnemonicMock.mockRestore();
	});

	it("should validate secret", async () => {
		const fromSecretMock = vi
			.spyOn(AddressService.prototype, "fromSecret")
			.mockReturnValue({ address: wallet.address(), type: "secret" });

		const secret = authentication(translationMock).secret(wallet);

		await expect(secret.validate("secret")).toBe(true);

		fromSecretMock.mockRestore();
	});

	it("should fail secret validation if the secret belongs to another address", async () => {
		const secret = authentication(translationMock).secret(wallet);

		await expect(secret.validate("secret1")).toBe("COMMON.INPUT_PASSPHRASE.VALIDATION.SECRET_NOT_MATCH_WALLET");
	});

	it("should fail secret validation if a mnemonic is used", async () => {
		const secret = authentication(translationMock).secret(wallet);

		await expect(secret.validate(MNEMONICS[0])).toBe("COMMON.INPUT_PASSPHRASE.VALIDATION.SECRET_NOT_MATCH_WALLET");
	});

	it("should validate encryption password with BIP39", async () => {
		const fromMnemonicMock = vi
			.spyOn(AddressService.prototype, "fromMnemonic")
			.mockReturnValue({ address: walletWithPassword.address(), type: "bip39" });

		const walletWifMock = vi.spyOn(walletWithPassword.signingKey(), "get").mockReturnValue(MNEMONICS[1]);

		const encryptionPassword = authentication(translationMock).encryptionPassword(walletWithPassword);

		await expect(encryptionPassword.validate("password")).resolves.toBe(true);

		fromMnemonicMock.mockRestore();
		walletWifMock.mockRestore();
	});

	it("should validate encryption password with secret", async () => {
		const BIP39Mock = vi.spyOn(BIP39, "validate").mockReturnValue(false);

		const fromSecretMock = vi
			.spyOn(AddressService.prototype, "fromSecret")
			.mockReturnValue({ address: walletWithPassword.address(), type: "secret" });

		const walletWifMock = vi.spyOn(walletWithPassword.signingKey(), "get").mockReturnValue("not a mnemonic");

		const encryptionPassword = authentication(translationMock).encryptionPassword(walletWithPassword);

		await expect(encryptionPassword.validate("password")).resolves.toBe(true);

		fromSecretMock.mockRestore();
		walletWifMock.mockRestore();
		BIP39Mock.mockRestore();
	});

	it("should validate WIF", async () => {
		const fromWifMock = vi
			.spyOn(AddressService.prototype, "fromWIF")
			.mockReturnValue({ address: wallet.address(), type: "bip39" });

		const authWif = authentication(translationMock).wif(wallet);
		const wif = "S9q9B5EUjVSFxKxGeJ7SG69YgCiGFfS29r5ZhfoSKZ2ALbPMyFoL";

		await expect(authWif.validate.matchSenderAddress(wif)).toBe(true);

		fromWifMock.mockRestore();
	});

	it("should validate private key", async () => {
		const fromPrivateKeyMock = vi
			.spyOn(AddressService.prototype, "fromPrivateKey")
			.mockReturnValue({ address: wallet.address(), type: "bip39" });

		const authPrivateKey = authentication(translationMock).privateKey(wallet);

		const privateKey = "d8839c2432bfd0a67ef10a804ba991eabba19f154a3d707917681d45822a5712";

		await expect(authPrivateKey.validate(privateKey)).toBe(true);

		fromPrivateKeyMock.mockRestore();
	});

	it("should fail private key validation", async () => {
		const authPrivateKey = authentication(translationMock).privateKey(wallet);

		const privateKey = "d8839c2432bfd0a67ef10a804ba991eabba19f154a3d707917681d45822a5712";

		await expect(authPrivateKey.validate(privateKey)).toBe(
			"COMMON.INPUT_PASSPHRASE.VALIDATION.PRIVATE_KEY_NOT_MATCH_WALLET",
		);
	});

	it("should fail WIF validation", async () => {
		const fromWifMock = vi
			.spyOn(AddressService.prototype, "fromWIF")
			.mockReturnValue({ address: "other", type: "bip39" });

		const authWif = authentication(translationMock).wif(wallet);

		const wif = "S9q9B5EUjVSFxKxGeJ7SG69YgCiGFfS29r5ZhfoSKZ2ALbPMyFoL";

		await expect(authWif.validate.matchSenderAddress(wif)).toBe(
			"COMMON.INPUT_PASSPHRASE.VALIDATION.WIF_NOT_MATCH_WALLET",
		);

		fromWifMock.mockRestore();
	});

	it("should fail validation for encryption password", async () => {
		const walletWifMock = vi.spyOn(walletWithPassword.signingKey(), "get").mockImplementation(() => {
			throw new Error("failed");
		});

		const fromWifMock = vi
			.spyOn(AddressService.prototype, "fromWIF")
			.mockReturnValue({ address: walletWithPassword.address(), type: "bip39" });

		const encryptionPassword = authentication(translationMock).encryptionPassword(walletWithPassword);

		await expect(encryptionPassword.validate(walletWithPassword.address())).resolves.toBe(
			"COMMON.INPUT_PASSPHRASE.VALIDATION.PASSWORD_NOT_MATCH_WALLET",
		);

		await expect(encryptionPassword.validate("wrong password")).resolves.toBe(
			"COMMON.INPUT_PASSPHRASE.VALIDATION.PASSWORD_NOT_MATCH_WALLET",
		);

		fromWifMock.mockRestore();
		walletWifMock.mockRestore();
	});
});
