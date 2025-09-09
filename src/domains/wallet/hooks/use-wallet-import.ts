import { Networks } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import { useWalletSync } from "@/domains/wallet/hooks/use-wallet-sync";
import { getDefaultAlias, getLedgerDefaultAlias } from "@/domains/wallet/utils/get-default-alias";
import { useEnvironmentContext } from "@/app/contexts";

import { OptionsValue } from "./use-import-options";
import { assertString, assertWallet } from "@/utils/assertions";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { AddressViewSelection } from "@/app/lib/profiles/wallet.enum";

type PrivateKey = string;
type Mnemonic = string;
type WIF = string;
type Address = string;

export type WalletGenerationInput = PrivateKey | Mnemonic | WIF | Address;

type ImportOptionsType = {
	[key in OptionsValue]: () => Promise<Contracts.IReadWriteWallet>;
} & {
	default: () => undefined;
};

export const useWalletImport = ({ profile }: { profile: Contracts.IProfile }) => {
	const { env, persist } = useEnvironmentContext();
	const { syncAll } = useWalletSync({ env, profile });
	const { activeNetwork } = useActiveNetwork({ profile });

	const importWalletByType = async ({
		network,
		type,
		value,
		ledgerOptions,
	}: {
		network: Networks.Network;
		type: string;
		value: WalletGenerationInput;
		ledgerOptions?: {
			deviceId: string;
			path: string;
		};
	}): Promise<Contracts.IReadWriteWallet | undefined> => {
		const defaultOptions = {
			coin: network.coin(),
			network: network.id(),
		};

		const importOptions: ImportOptionsType = {
			[OptionsValue.LEDGER]: async () => {
				const path = ledgerOptions?.path;
				assertString(path);

				const wallet = await profile.walletFactory().fromAddressWithDerivationPath({
					...defaultOptions,
					address: value,
					path,
				});

				wallet.data().set(Contracts.WalletData.LedgerModel, ledgerOptions?.deviceId);

				if (!profile.wallets().findByAddressWithNetwork(wallet.address(), wallet.network().id())) {
					return profile.wallets().push(wallet);
				}

				return wallet;
			},
			[OptionsValue.BIP39]: async () =>
				profile.wallets().push(
					await profile.walletFactory().fromMnemonicWithBIP39({
						...defaultOptions,
						mnemonic: value,
					}),
				),
			[OptionsValue.BIP44]: async () =>
				profile.wallets().push(
					await profile.walletFactory().fromMnemonicWithBIP44({
						...defaultOptions,
						levels: { account: 0 },
						mnemonic: value,
					}),
				),
			[OptionsValue.BIP49]: async () =>
				profile.wallets().push(
					await profile.walletFactory().fromMnemonicWithBIP49({
						...defaultOptions,
						levels: { account: 0 },
						mnemonic: value,
					}),
				),
			[OptionsValue.BIP84]: async () =>
				profile.wallets().push(
					await profile.walletFactory().fromMnemonicWithBIP84({
						...defaultOptions,
						levels: { account: 0 },
						mnemonic: value,
					}),
				),
			[OptionsValue.ADDRESS]: async () =>
				profile.wallets().push(
					await profile.walletFactory().fromAddress({
						...defaultOptions,
						address: value,
					}),
				),
			[OptionsValue.PUBLIC_KEY]: async () =>
				profile.wallets().push(
					await profile.walletFactory().fromPublicKey({
						...defaultOptions,
						publicKey: value,
					}),
				),
			[OptionsValue.SECRET]: async () =>
				profile.wallets().push(
					await profile.walletFactory().fromSecret({
						...defaultOptions,
						secret: value,
					}),
				),
			default: () => void 0,
		};

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		return (importOptions[type as keyof typeof importOptions] || importOptions.default)();
	};

	const importWallet = async ({
		network,
		value,
		type,
		ledgerOptions,
	}: {
		value: WalletGenerationInput;
		network: Networks.Network;
		type: string;
		ledgerOptions?: {
			deviceId: string;
			path: string;
		};
	}): Promise<Contracts.IReadWriteWallet> => {
		const wallet = await importWalletByType({
			ledgerOptions,
			network,
			type,
			value,
		});

		assertWallet(wallet);

		if (network.id() === activeNetwork.id()) {
			await syncAll(wallet);
		}

		const alias = ledgerOptions?.path
			? getLedgerDefaultAlias({ network, path: ledgerOptions.path, profile })
			: getDefaultAlias({ network, profile });

		wallet.mutator().alias(alias);

		return wallet;
	};

	const importWallets = async ({
		value,
		type,
		ledgerOptions,
		disableAddressSelection = false,
	}: {
		value: WalletGenerationInput;
		type: string;
		ledgerOptions?: {
			deviceId: string;
			path: string;
		};
		disableAddressSelection?: boolean;
	}) => {
		const wallets: Contracts.IReadWriteWallet[] = [];

		const wallet = await importWallet({
			ledgerOptions,
			network: profile.activeNetwork(),
			type,
			value,
		});
		wallets.push(wallet);

		if (profile.walletSelectionMode() === AddressViewSelection.single) {
			if (!disableAddressSelection) {
				profile.wallets().selectOne(wallet);
			}
		} else {
			wallet.mutator().isSelected(true);
		}

		await persist();

		return wallets;
	};

	return { importWallet, importWallets };
};
