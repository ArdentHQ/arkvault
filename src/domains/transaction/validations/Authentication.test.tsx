import { BIP39 } from "@ardenthq/arkvault-crypto";
import { Contracts } from "@/app/lib/profiles";

import { authentication } from "./Authentication";
import { env, MNEMONICS } from "@/utils/testing-library";

let translationMock: any;
let wallet: Contracts.IReadWriteWallet;
let walletWithPassword: Contracts.IReadWriteWallet;

import { AddressService } from "@/app/lib/mainsail/address.service";
import { HDWalletService } from "@/app/lib/mainsail/hd-wallet.service";

vi.mock("@/utils/debounce", () => ({
	debounceAsync: (promise: Promise<any>) => promise,
}));

describe("Authentication", () => {
	let profile: Contracts.IProfile;

	beforeAll(async () => {
		translationMock = vi.fn((index18nString: string) => index18nString);

		profile = env.profiles().first();
		await env.profiles().restore(profile);
		await profile.sync();

		wallet = await profile.walletFactory().fromMnemonicWithBIP39({
			mnemonic: MNEMONICS[0],
		});

		walletWithPassword = await profile.walletFactory().fromMnemonicWithBIP39({
			mnemonic: MNEMONICS[1],
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

	it("should validate BIP44 mnemonic", async () => {
		const hdWalletMock = vi.spyOn(wallet, "isHDWallet").mockReturnValue(true);

		const fromMnemonicMock = vi.spyOn(HDWalletService, "getAccount").mockReturnValue({ address: wallet.address() });

		const mnemonic = authentication(translationMock).mnemonic(wallet);

		await expect(mnemonic.validate.matchSenderAddress(MNEMONICS[0])).toBe(true);

		fromMnemonicMock.mockRestore();
		hdWalletMock.mockRestore();
	});

	it("should validate BIP44 mnemonic with encryption", async () => {
		const bip44Wallet = await profile.walletFactory().fromMnemonicWithBIP44({
			levels: { account: 0 },
			mnemonic: MNEMONICS[1],
			password: "password",
		});

		const mnemonic = authentication(translationMock).encryptionPassword(bip44Wallet);

		const result = await mnemonic.validate("password");
		expect(result).toBe(true);
	});

	it("should fail mnemonic validation", async () => {
		const mnemonic = authentication(translationMock).mnemonic(wallet);

		await expect(mnemonic.validate.matchSenderAddress(MNEMONICS[1])).toBe(
			"COMMON.INPUT_PASSPHRASE.VALIDATION.MNEMONIC_NOT_MATCH_ADDRESS",
		);
	});

	it("should fail mnemonic validation for invalid mnemonic", async () => {
		const fromMnemonicMock = vi.spyOn(AddressService.prototype, "fromMnemonic").mockImplementation(() => {
			throw new Error("invalid");
		});

		const mnemonic = authentication(translationMock).mnemonic(wallet);

		await expect(mnemonic.validate.matchSenderAddress("invalid mnemonic")).toBe(
			"COMMON.INPUT_PASSPHRASE.VALIDATION.MNEMONIC_NOT_MATCH_ADDRESS",
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

		await expect(secret.validate("secret1")).toBe("COMMON.INPUT_PASSPHRASE.VALIDATION.SECRET_NOT_MATCH_ADDRESS");
	});

	it("should fail secret validation if a mnemonic is used", async () => {
		const secret = authentication(translationMock).secret(wallet);

		await expect(secret.validate(MNEMONICS[0])).toBe("COMMON.INPUT_PASSPHRASE.VALIDATION.SECRET_NOT_MATCH_ADDRESS");
	});

	it("should validate encryption password with BIP39", async () => {
		const fromMnemonicMock = vi
			.spyOn(AddressService.prototype, "fromMnemonic")
			.mockReturnValue({ address: walletWithPassword.address(), type: "bip39" });

		const encryptionPassword = authentication(translationMock).encryptionPassword(walletWithPassword);

		await expect(encryptionPassword.validate("password")).resolves.toBe(true);

		fromMnemonicMock.mockRestore();
	});

	it("should validate encryption password with secret", async () => {
		const BIP39Mock = vi.spyOn(BIP39, "validate").mockReturnValue(false);

		const fromSecretMock = vi
			.spyOn(AddressService.prototype, "fromSecret")
			.mockReturnValue({ address: walletWithPassword.address(), type: "secret" });

		const encryptionPassword = authentication(translationMock).encryptionPassword(walletWithPassword);

		await expect(encryptionPassword.validate("password")).resolves.toBe(true);

		fromSecretMock.mockRestore();
		BIP39Mock.mockRestore();
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
			"COMMON.INPUT_PASSPHRASE.VALIDATION.PRIVATE_KEY_NOT_MATCH_ADDRESS",
		);
	});

	it("should fail validation for encryption password", async () => {
		const encryptionPassword = authentication(translationMock).encryptionPassword(walletWithPassword);

		await expect(encryptionPassword.validate(walletWithPassword.address())).resolves.toBe(
			"COMMON.INPUT_PASSPHRASE.VALIDATION.PASSWORD_NOT_MATCH_ADDRESS",
		);

		await expect(encryptionPassword.validate("wrong password")).resolves.toBe(
			"COMMON.INPUT_PASSPHRASE.VALIDATION.PASSWORD_NOT_MATCH_ADDRESS",
		);
	});

	it("should validate second mnemonic", async () => {
		const secondMnemonicMock = vi
			.spyOn(wallet, "secondPublicKey")
			.mockReturnValue("03d7001f0cfff639c0e458356581c919d5885868f14f72ba3be74c8f105cce34ac");
		const secondMnemonic = authentication(translationMock).secondMnemonic(wallet);

		expect(secondMnemonic.validate.matchSenderPublicKey(MNEMONICS[0])).toBe(true);

		secondMnemonicMock.mockRestore();
	});

	it("should fail second mnemonic validation", async () => {
		const secondMnemonicMock = vi.spyOn(wallet, "secondPublicKey").mockReturnValue("1");
		const secondMnemonic = authentication(translationMock).secondMnemonic(wallet);

		expect(secondMnemonic.validate.matchSenderPublicKey(MNEMONICS[0])).toBe(
			"COMMON.INPUT_PASSPHRASE.VALIDATION.MNEMONIC_NOT_MATCH_ADDRESS",
		);

		secondMnemonicMock.mockRestore();
	});

	it("should fail second mnemonic validation if exception is thrown", async () => {
		const secondMnemonicMock = vi.spyOn(wallet, "secondPublicKey").mockImplementation(() => {
			throw new Error("error");
		});
		const secondMnemonic = authentication(translationMock).secondMnemonic(wallet);

		expect(secondMnemonic.validate.matchSenderPublicKey(MNEMONICS[0])).toBe(
			"COMMON.INPUT_PASSPHRASE.VALIDATION.MNEMONIC_NOT_MATCH_ADDRESS",
		);

		secondMnemonicMock.mockRestore();
	});

	it("should validate second secret", async () => {
		const secondSecretMock = vi
			.spyOn(wallet, "secondPublicKey")
			.mockReturnValue("03a02b9d5fdd1307c2ee4652ba54d492d1fd11a7d1bb3f3a44c4a05e79f19de933");
		const secondSecret = authentication(translationMock).secondSecret(wallet);

		expect(secondSecret.validate.matchSenderPublicKey("secret")).toBe(true);

		secondSecretMock.mockRestore();
	});

	it("should fail second secret validation", async () => {
		const secondSecretMock = vi.spyOn(wallet, "secondPublicKey").mockReturnValue("1");
		const secondSecret = authentication(translationMock).secondSecret(wallet);

		expect(secondSecret.validate.matchSenderPublicKey("secret")).toBe(
			"COMMON.INPUT_PASSPHRASE.VALIDATION.SECRET_NOT_MATCH_ADDRESS",
		);

		secondSecretMock.mockRestore();
	});

	it("should fail second secret validation if exception is thrown", async () => {
		const secondSecretMock = vi.spyOn(wallet, "secondPublicKey").mockImplementation(() => {
			throw new Error("error");
		});
		const secondSecret = authentication(translationMock).secondSecret(wallet);

		expect(secondSecret.validate.matchSenderPublicKey(MNEMONICS[0])).toBe(
			"COMMON.INPUT_PASSPHRASE.VALIDATION.SECRET_NOT_MATCH_ADDRESS",
		);

		secondSecretMock.mockRestore();
	});
});
