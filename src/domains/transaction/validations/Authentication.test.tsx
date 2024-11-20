/* eslint-disable @typescript-eslint/require-await */
import { BIP39 } from "@ardenthq/sdk-cryptography";
import { Contracts } from "@ardenthq/sdk-profiles";

import { authentication } from "./Authentication";
import { env, MNEMONICS } from "@/utils/testing-library";

let translationMock: any;
let wallet: Contracts.IReadWriteWallet;
let walletWithPassword: Contracts.IReadWriteWallet;

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
			coin: "ARK",
			mnemonic: MNEMONICS[0],
			network: "ark.devnet",
		});

		walletWithPassword = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: MNEMONICS[1],
			network: "ark.devnet",
			password: "password",
		});

		env.profiles().first().wallets().push(wallet);
		env.profiles().first().wallets().push(walletWithPassword);

		await wallet.synchroniser().identity();
		await walletWithPassword.synchroniser().identity();
	});

	it("should validate mnemonic", async () => {
		const fromWifMock = vi
			.spyOn(wallet.coin().address(), "fromWIF")
			.mockResolvedValue({ address: wallet.address(), type: "bip39" });

		const mnemonic = authentication(translationMock).mnemonic(wallet);

		await expect(mnemonic.validate.matchSenderAddress(MNEMONICS[0])).resolves.toBe(true);

		fromWifMock.mockRestore();
	});

	it("should fail mnemonic validation", async () => {
		const mnemonic = authentication(translationMock).mnemonic(wallet);

		await expect(mnemonic.validate.matchSenderAddress(MNEMONICS[1])).resolves.toBe(
			"COMMON.INPUT_PASSPHRASE.VALIDATION.MNEMONIC_NOT_MATCH_WALLET",
		);
	});

	it("should validate secret", async () => {
		const fromWifMock = vi
			.spyOn(wallet.coin().address(), "fromSecret")
			.mockResolvedValue({ address: wallet.address(), type: "secret" });

		const secret = authentication(translationMock).secret(wallet);

		await expect(secret.validate("secret")).resolves.toBe(true);

		fromWifMock.mockRestore();
	});

	it("should fail secret validation if the secret belongs to another address", async () => {
		const secret = authentication(translationMock).secret(wallet);

		await expect(secret.validate("secret1")).resolves.toBe(
			"COMMON.INPUT_PASSPHRASE.VALIDATION.SECRET_NOT_MATCH_WALLET",
		);
	});

	it("should fail secret validation if a mnemonic is used", async () => {
		const secret = authentication(translationMock).secret(wallet);

		await expect(secret.validate(MNEMONICS[0])).resolves.toBe(
			"COMMON.INPUT_PASSPHRASE.VALIDATION.SECRET_NOT_MATCH_WALLET",
		);
	});

	it("should validate encryption password with BIP39", async () => {
		const fromWifMock = vi
			.spyOn(walletWithPassword.coin().address(), "fromWIF")
			.mockResolvedValue({ address: walletWithPassword.address() } as any);
		const walletWifMock = vi.spyOn(walletWithPassword.signingKey(), "get").mockReturnValue(MNEMONICS[1]);

		const encryptionPassword = authentication(translationMock).encryptionPassword(walletWithPassword);

		await expect(encryptionPassword.validate("password")).resolves.toBe(true);

		fromWifMock.mockRestore();
		walletWifMock.mockRestore();
	});

	it("should validate encryption password with secret", async () => {
		const BIP39Mock = vi.spyOn(BIP39, "validate").mockReturnValue(false);

		const fromWifMock = vi
			.spyOn(walletWithPassword.coin().address(), "fromWIF")
			.mockResolvedValue({ address: walletWithPassword.address() } as any);
		const walletWifMock = vi.spyOn(walletWithPassword.signingKey(), "get").mockReturnValue(MNEMONICS[1]);

		const encryptionPassword = authentication(translationMock).encryptionPassword(walletWithPassword);

		await expect(encryptionPassword.validate("password")).resolves.toBe(true);

		fromWifMock.mockRestore();
		walletWifMock.mockRestore();
		BIP39Mock.mockRestore();
	});

	it("should validate WIF", async () => {
		const fromWifMock = vi
			.spyOn(wallet.coin().address(), "fromWIF")
			.mockResolvedValue({ address: wallet.address() } as any);

		const authWif = authentication(translationMock).wif(wallet);
		const wif = "S9q9B5EUjVSFxKxGeJ7SG69YgCiGFfS29r5ZhfoSKZ2ALbPMyFoL";

		await expect(authWif.validate.matchSenderAddress(wif)).resolves.toBe(true);

		fromWifMock.mockRestore();
	});

	it("should validate private key", async () => {
		const fromPrivateKeyMock = vi
			.spyOn(wallet.coin().address(), "fromPrivateKey")
			.mockResolvedValue({ address: wallet.address() } as any);

		const authPrivateKey = authentication(translationMock).privateKey(wallet);

		const privateKey = "d8839c2432bfd0a67ef10a804ba991eabba19f154a3d707917681d45822a5712";

		await expect(authPrivateKey.validate(privateKey)).resolves.toBe(true);

		fromPrivateKeyMock.mockRestore();
	});

	it("should fail private key validation", async () => {
		const authPrivateKey = authentication(translationMock).privateKey(wallet);

		const privateKey = "d8839c2432bfd0a67ef10a804ba991eabba19f154a3d707917681d45822a5712";

		await expect(authPrivateKey.validate(privateKey)).resolves.toBe(
			"COMMON.INPUT_PASSPHRASE.VALIDATION.PRIVATE_KEY_NOT_MATCH_WALLET",
		);
	});

	it("should fail WIF validation", async () => {
		const authWif = authentication(translationMock).wif(wallet);

		const wif = "S9q9B5EUjVSFxKxGeJ7SG69YgCiGFfS29r5ZhfoSKZ2ALbPMyFoL";

		await expect(authWif.validate.matchSenderAddress(wif)).resolves.toBe(
			"COMMON.INPUT_PASSPHRASE.VALIDATION.WIF_NOT_MATCH_WALLET",
		);
	});

	it("should fail validation for encryption password", async () => {
		const walletWifMock = vi.spyOn(walletWithPassword.signingKey(), "get").mockImplementation(() => {
			throw new Error("failed");
		});

		const fromWifMock = vi
			.spyOn(walletWithPassword.coin().address(), "fromWIF")
			.mockResolvedValue({ address: walletWithPassword.address(), type: "bip39" });

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
