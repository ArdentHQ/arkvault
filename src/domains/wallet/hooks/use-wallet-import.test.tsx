import React from "react";
import { Networks } from "@ardenthq/sdk";
import { Contracts, Wallet } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react";

import { OptionsValue } from "./use-import-options";
import { useWalletImport } from "./use-wallet-import";
import { env, MNEMONICS } from "@/utils/testing-library";
import { ConfigurationProvider, EnvironmentProvider } from "@/app/contexts";

let profile: Contracts.IProfile;
let network: Networks.Network;
let wallet: Contracts.IReadWriteWallet;

describe("useWalletImport", () => {
	const wrapper = ({ children }: any) => (
		<EnvironmentProvider env={env}>
			<ConfigurationProvider>{children}</ConfigurationProvider>
		</EnvironmentProvider>
	);
	beforeAll(async () => {
		profile = env.profiles().first();
		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();
		network = wallet.network();
	});

	it("should import wallet from mnemonic with bip39", async () => {
		const {
			result: { current },
		} = renderHook(() => useWalletImport({ profile }), { wrapper });

		const wallet = await current.importWallet({
			encryptedWif: "",
			network,
			type: OptionsValue.BIP39,
			value: MNEMONICS[0],
		});

		expect(wallet).toBeInstanceOf(Wallet);
	});

	it.each([OptionsValue.BIP44, OptionsValue.BIP49, OptionsValue.BIP84])(
		"should reject import wallet from mnemonic with %s",
		async (mnemonicType) => {
			const {
				result: { current },
			} = renderHook(() => useWalletImport({ profile }), { wrapper });

			const mockMnemonicMethod = vi
				.spyOn(profile.walletFactory(), `fromMnemonicWith${mnemonicType.toUpperCase()}` as never)
				.mockImplementation(() => {
					throw new Error("error");
				});

			await expect(
				current.importWallet({
					encryptedWif: "",
					network,
					type: mnemonicType,
					value: "mnemonic",
				}),
			).rejects.toThrow("error");

			mockMnemonicMethod.mockRestore();
		},
	);

	it.each([OptionsValue.ADDRESS, OptionsValue.PUBLIC_KEY, OptionsValue.PRIVATE_KEY])(
		"should reject import wallet from %s",
		async (importType) => {
			const {
				result: { current },
			} = renderHook(() => useWalletImport({ profile }), { wrapper });

			const methodName = `from${importType.charAt(0).toUpperCase()}${importType.slice(1)}` as never;
			const mockEncryptedWif = vi.spyOn(profile.walletFactory(), methodName).mockImplementation(() => {
				throw new Error("error");
			});

			await expect(
				current.importWallet({
					encryptedWif: "",
					network,
					type: importType,
					value: importType,
				}),
			).rejects.toThrow("error");

			mockEncryptedWif.mockRestore();
		},
	);

	it("should reject import wallet from WIF", async () => {
		const {
			result: { current },
		} = renderHook(() => useWalletImport({ profile }), { wrapper });

		const mockEncryptedWif = vi.spyOn(profile.walletFactory(), "fromWIF").mockImplementation(() => {
			throw new Error("error");
		});

		await expect(
			current.importWallet({
				encryptedWif: "",
				network,
				type: OptionsValue.WIF,
				value: "WIF",
			}),
		).rejects.toThrow("error");

		mockEncryptedWif.mockRestore();
	});

	it("should import wallet from encryptedWif", async () => {
		const {
			result: { current },
		} = renderHook(() => useWalletImport({ profile }), { wrapper });

		const { wallet: newWallet } = await profile.walletFactory().generate({
			coin: network.coin(),
			network: network.id(),
		});

		const countBefore = profile.wallets().count();

		const mockEncryptedWif = vi
			.spyOn(profile.walletFactory(), "fromWIF")
			.mockImplementation(() => Promise.resolve(newWallet));

		await expect(
			current.importWallet({
				encryptedWif: "wif",
				network,
				type: OptionsValue.ENCRYPTED_WIF,
				value: "password",
			}),
		).resolves.toBeInstanceOf(Wallet);

		expect(profile.wallets().count()).toBe(countBefore + 1);

		mockEncryptedWif.mockRestore();
	});

	it("should import wallet from secret", async () => {
		const {
			result: { current },
		} = renderHook(() => useWalletImport({ profile }), { wrapper });

		const countBefore = profile.wallets().count();

		await expect(
			current.importWallet({
				encryptedWif: "",
				network,
				type: OptionsValue.SECRET,
				value: "secret",
			}),
		).resolves.toBeInstanceOf(Wallet);

		expect(profile.wallets().count()).toBe(countBefore + 1);
	});

	it("should reject import wallet from encryptedWif", async () => {
		const {
			result: { current },
		} = renderHook(() => useWalletImport({ profile }), { wrapper });

		const mockEncryptedWif = vi
			.spyOn(profile.walletFactory(), "fromWIF")
			.mockImplementation(() => Promise.reject(new Error("error")));

		await expect(
			current.importWallet({
				encryptedWif: "wif",
				network,
				type: OptionsValue.ENCRYPTED_WIF,
				value: "password",
			}),
		).rejects.toThrow("error");

		mockEncryptedWif.mockRestore();
	});

	it("should return undefined for type unknown", async () => {
		const {
			result: { current },
		} = renderHook(() => useWalletImport({ profile }), { wrapper });

		await expect(
			current.importWallet({ encryptedWif: "", network, type: "unknown", value: "value" }),
		).rejects.toThrow();
	});
});
