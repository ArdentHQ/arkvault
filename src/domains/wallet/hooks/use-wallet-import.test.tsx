import React from "react";
import { Networks } from "@/app/lib/mainsail";
import { Contracts, Wallet } from "@/app/lib/profiles";
import { act, renderHook } from "@testing-library/react";

import { OptionsValue } from "./use-import-options";
import { useWalletImport } from "./use-wallet-import";
import { env, getMainsailProfileId, MAINSAIL_MNEMONICS } from "@/utils/testing-library";
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
		profile = env.profiles().findById(getMainsailProfileId());
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
			network,
			type: OptionsValue.BIP39,
			value: MAINSAIL_MNEMONICS[0],
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
					network,
					type: mnemonicType,
					value: "mnemonic",
				}),
			).rejects.toThrow("error");

			mockMnemonicMethod.mockRestore();
		},
	);

	it.each([OptionsValue.ADDRESS, OptionsValue.PUBLIC_KEY])(
		"should reject import wallet from %s",
		async (importType) => {
			const {
				result: { current },
			} = renderHook(() => useWalletImport({ profile }), { wrapper });

			const methodName = `from${importType.charAt(0).toUpperCase()}${importType.slice(1)}` as never;
			const mockEncrypted = vi.spyOn(profile.walletFactory(), methodName).mockImplementation(() => {
				throw new Error("error");
			});

			await expect(
				current.importWallet({
					network,
					type: importType,
					value: importType,
				}),
			).rejects.toThrow("error");

			mockEncrypted.mockRestore();
		},
	);

	it("should import wallet from secret", async () => {
		const {
			result: { current },
		} = renderHook(() => useWalletImport({ profile }), { wrapper });

		const countBefore = profile.wallets().count();

		await expect(
			current.importWallet({
				network,
				type: OptionsValue.SECRET,
				value: "secret",
			}),
		).resolves.toBeInstanceOf(Wallet);

		expect(profile.wallets().count()).toBe(countBefore + 1);
	});

	it("should return undefined for type unknown", async () => {
		const {
			result: { current },
		} = renderHook(() => useWalletImport({ profile }), { wrapper });

		await expect(current.importWallet({ network, type: "unknown", value: "value" })).rejects.toThrow();
	});

	it("should set imported wallet as the only selected wallet when view preference is set to single", async () => {
		const { result: walletImport } = renderHook(() => useWalletImport({ profile }), { wrapper });

		const wallets = await act(
			async () =>
				await walletImport.current.importWallets({
					networks: [network],
					type: OptionsValue.BIP39,
					value: MAINSAIL_MNEMONICS[1],
				}),
		);

		expect(wallets).toHaveLength(1);
		const importedWallet = wallets[0];

		expect(importedWallet).toBeInstanceOf(Wallet);
		expect(importedWallet.address()).toBeDefined();

		expect(importedWallet.isSelected()).toBe(true);
	});

	it("should append imported wallet to the selected addresses when view preference is set to multiple", async () => {
		const { result: walletImport } = renderHook(() => useWalletImport({ profile }), { wrapper });

		const wallets = await act(
			async () =>
				await walletImport.current.importWallets({
					networks: [network],
					type: OptionsValue.BIP39,
					value: MAINSAIL_MNEMONICS[2],
				}),
		);

		expect(wallets).toHaveLength(1);
		const importedWallet = wallets[0];

		expect(importedWallet).toBeInstanceOf(Wallet);
		expect(importedWallet.address()).toBeDefined();

		expect(importedWallet.isSelected()).toBe(true);
	});
});
