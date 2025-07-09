import { describe, vi, expect, beforeEach, it, afterEach } from "vitest";
import {
	IProfile,
	IReadWriteWallet,
	IWalletMutator,
	WalletData,
	WalletImportMethod,
	WalletSetting,
} from "./contracts.js";
import { env, MAINSAIL_MNEMONICS } from "@/utils/testing-library";

let profile: IProfile;
let wallet: IReadWriteWallet;
let subject: IWalletMutator;

describe("WalletMutator", () => {
	beforeEach(async () => {
		profile = await env.profiles().create("test profile");
		wallet = await profile.walletFactory().fromMnemonicWithBIP39({
			mnemonic: MAINSAIL_MNEMONICS[0],
		});
		subject = wallet.mutator();
	});

	afterEach(() => {
		env.profiles().forget(profile.id());
		vi.restoreAllMocks();
	});

	describe("identity", () => {
		it("should set the wallet data from a mnemonic", async () => {
			const mnemonic = MAINSAIL_MNEMONICS[1];
			const originalAddress = wallet.address();

			await subject.identity(mnemonic);

			expect(wallet.address()).not.toBe(originalAddress);
			expect(wallet.data().get(WalletData.DerivationType)).toBe("bip39");
			expect(wallet.data().get(WalletData.ImportMethod)).toBe(WalletImportMethod.BIP39.MNEMONIC);
		});
	});

	describe("address", () => {
		it("should set the wallet address", async () => {
			const newAddress = "new-address";
			const originalAddress = wallet.address();

			await subject.address({ address: newAddress });

			expect(wallet.address()).toBe(newAddress);
			expect(wallet.address()).not.toBe(originalAddress);
		});

		it("should set the address and derivation path", async () => {
			const newAddress = "new-address";
			const path = "m/44'/0'/0'/0/0";

			await subject.address({ address: newAddress, path });

			expect(wallet.address()).toBe(newAddress);
			expect(wallet.data().get(WalletData.DerivationPath)).toBe(path);
		});
	});

	describe("avatar", () => {
		it("should set the wallet avatar", () => {
			const newAvatar = "new-avatar-string";
			subject.avatar(newAvatar);

			const expectedAvatar = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#45A2EB"/></svg>`;
			expect(wallet.getAttributes().get("avatar")).toBe(expectedAvatar);
			expect(wallet.settings().get(WalletSetting.Avatar)).toBe(expectedAvatar);
		});
	});

	describe("alias", () => {
		it("should set the wallet alias", () => {
			const newAlias = "New Alias";
			subject.alias(newAlias);

			expect(wallet.settings().get(WalletSetting.Alias)).toBe(newAlias);
		});
	});

	describe("isSelected", () => {
		it("should set the wallet as selected", () => {
			subject.isSelected(true);
			expect(wallet.settings().get(WalletSetting.IsSelected)).toBe(true);
		});

		it("should set the wallet as not selected", () => {
			subject.isSelected(false);
			expect(wallet.settings().get(WalletSetting.IsSelected)).toBe(false);
		});
	});

	describe("removeEncryption", () => {
		const password = "password";

		beforeEach(async () => {
			wallet = await profile.walletFactory().fromMnemonicWithBIP39({
				mnemonic: MAINSAIL_MNEMONICS[0],
				password,
			});
			subject = wallet.mutator();
		});

		it("should remove the encryption from the wallet", async () => {
			vi.spyOn(wallet, "isSecondSignature").mockReturnValue(false);

			expect(wallet.importMethod()).toBe(WalletImportMethod.BIP39.MNEMONIC_WITH_ENCRYPTION);
			await subject.removeEncryption(password);
			expect(wallet.importMethod()).toBe(WalletImportMethod.BIP39.MNEMONIC);
		});

		it("should throw if the import method is not supported", async () => {
			wallet.data().set(WalletData.ImportMethod, WalletImportMethod.Address);
			await expect(subject.removeEncryption(password)).rejects.toThrow(
				"Import method [ADDRESS] is not supported.",
			);
		});

		it("should throw if the password is wrong", async () => {
			await expect(subject.removeEncryption("wrong-password")).rejects.toThrow(
				"The provided password does not match the wallet.",
			);
		});
	});
});
