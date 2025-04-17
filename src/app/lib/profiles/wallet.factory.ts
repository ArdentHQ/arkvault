/* istanbul ignore file */

import { Enums } from "@ardenthq/sdk";
import { BIP38, BIP39, UUID } from "@ardenthq/sdk-cryptography";

import {
	IAddressOptions,
	IAddressWithDerivationPathOptions,
	IGenerateOptions,
	IMnemonicOptions,
	IPrivateKeyOptions,
	IProfile,
	IPublicKeyOptions,
	IReadWriteWallet,
	IWalletFactory,
	IWifOptions,
	WalletData,
	WalletImportMethod,
} from "./contracts.js";
import { WalletFlag } from "./wallet.enum.js";
import { IMnemonicDerivativeOptions, ISecretOptions } from "./wallet.factory.contract.js";
import { Wallet } from "./wallet.js";

export class WalletFactory implements IWalletFactory {
	readonly #profile: IProfile;

	public constructor(profile: IProfile) {
		this.#profile = profile;
	}

	/** {@inheritDoc IWalletFactory.generate} */
	public async generate({
		coin,
		network,
		locale,
		wordCount,
		withPublicKey,
	}: IGenerateOptions): Promise<{ mnemonic: string; wallet: IReadWriteWallet }> {
		const mnemonic: string = BIP39.generate(locale, wordCount);

		const wallet = await this.fromMnemonicWithBIP39({ coin, mnemonic, network });

		if (withPublicKey) {
			const value = (await wallet.coin().publicKey().fromMnemonic(mnemonic)).publicKey;
			wallet.data().set(WalletData.PublicKey, value);
		}

		return { mnemonic, wallet };
	}

	/** {@inheritDoc IWalletFactory.fromMnemonicWithBIP39} */
	public async fromMnemonicWithBIP39({
		coin,
		network,
		mnemonic,
		password,
	}: IMnemonicOptions): Promise<IReadWriteWallet> {
		const wallet: IReadWriteWallet = new Wallet(UUID.random(), {}, this.#profile);

		wallet.data().set(WalletData.ImportMethod, WalletImportMethod.BIP39.MNEMONIC);
		wallet.data().set(WalletData.Status, WalletFlag.Cold);

		await wallet.mutator().coin(coin, network);

		if (wallet.network().usesExtendedPublicKey()) {
			throw new Error("The configured network uses extended public keys with BIP44 for derivation.");
		}

		if (!wallet.gate().allows(Enums.FeatureFlag.AddressMnemonicBip39)) {
			throw new Error("The configured network does not support BIP39.");
		}

		await wallet.mutator().identity(mnemonic);

		if (password) {
			wallet.data().set(WalletData.ImportMethod, WalletImportMethod.BIP39.MNEMONIC_WITH_ENCRYPTION);

			await wallet.signingKey().set(mnemonic, password);
		}

		return wallet;
	}

	/** {@inheritDoc IWalletFactory.fromMnemonicWithBIP44} */
	public async fromMnemonicWithBIP44(options: IMnemonicDerivativeOptions): Promise<IReadWriteWallet> {
		return this.#fromMnemonicWithDerivative({
			derivationType: "bip44",
			featureFlag: Enums.FeatureFlag.AddressMnemonicBip44,
			importMethod: WalletImportMethod.BIP44.MNEMONIC,
			options,
		});
	}

	/** {@inheritDoc IWalletFactory.fromMnemonicWithBIP49} */
	public async fromMnemonicWithBIP49(options: IMnemonicDerivativeOptions): Promise<IReadWriteWallet> {
		return this.#fromMnemonicWithDerivative({
			derivationType: "bip49",
			featureFlag: Enums.FeatureFlag.AddressMnemonicBip49,
			importMethod: WalletImportMethod.BIP49.MNEMONIC,
			options,
		});
	}

	/** {@inheritDoc IWalletFactory.fromMnemonicWithBIP84} */
	public async fromMnemonicWithBIP84(options: IMnemonicDerivativeOptions): Promise<IReadWriteWallet> {
		return this.#fromMnemonicWithDerivative({
			derivationType: "bip84",
			featureFlag: Enums.FeatureFlag.AddressMnemonicBip84,
			importMethod: WalletImportMethod.BIP84.MNEMONIC,
			options,
		});
	}

	/** {@inheritDoc IWalletFactory.fromAddress} */
	public async fromAddress({ coin, network, address }: IAddressOptions): Promise<IReadWriteWallet> {
		const wallet: IReadWriteWallet = new Wallet(UUID.random(), {}, this.#profile);
		wallet.data().set(WalletData.ImportMethod, WalletImportMethod.Address);
		wallet.data().set(WalletData.Status, WalletFlag.Cold);

		await wallet.mutator().coin(coin, network);
		await wallet.mutator().address({ address });

		return wallet;
	}

	/** {@inheritDoc IWalletFactory.fromPublicKey} */
	public async fromPublicKey({
		coin,
		network,
		publicKey,
		bip44,
		bip49,
		bip84,
	}: IPublicKeyOptions): Promise<IReadWriteWallet> {
		const wallet: IReadWriteWallet = new Wallet(UUID.random(), {}, this.#profile);
		wallet.data().set(WalletData.ImportMethod, WalletImportMethod.PublicKey);
		wallet.data().set(WalletData.PublicKey, publicKey);
		wallet.data().set(WalletData.Status, WalletFlag.Cold);

		await wallet.mutator().coin(coin, network);

		if (wallet.network().usesExtendedPublicKey()) {
			if (!bip44 && !bip49 && !bip84) {
				throw new Error("Please specify the levels and try again.");
			}

			await wallet
				.mutator()
				.address(await wallet.coin().address().fromPublicKey(publicKey, { bip44, bip49, bip84 }));
		} else {
			await wallet.mutator().address(await wallet.coin().address().fromPublicKey(publicKey));
		}

		return wallet;
	}

	/** {@inheritDoc IWalletFactory.fromPrivateKey} */
	public async fromPrivateKey({ coin, network, privateKey }: IPrivateKeyOptions): Promise<IReadWriteWallet> {
		const wallet: IReadWriteWallet = new Wallet(UUID.random(), {}, this.#profile);
		wallet.data().set(WalletData.ImportMethod, WalletImportMethod.PrivateKey);
		wallet.data().set(WalletData.Status, WalletFlag.Cold);

		await wallet.mutator().coin(coin, network);
		await wallet.mutator().address(await wallet.coin().address().fromPrivateKey(privateKey));

		return wallet;
	}

	/** {@inheritDoc IWalletFactory.fromAddressWithDerivationPath} */
	public async fromAddressWithDerivationPath({
		coin,
		network,
		address,
		path,
	}: IAddressWithDerivationPathOptions): Promise<IReadWriteWallet> {
		const wallet: IReadWriteWallet = new Wallet(UUID.random(), {}, this.#profile);

		if (path.startsWith("m/44")) {
			wallet.data().set(WalletData.ImportMethod, WalletImportMethod.BIP44.DERIVATION_PATH);
		}

		if (path.startsWith("m/49")) {
			wallet.data().set(WalletData.ImportMethod, WalletImportMethod.BIP49.DERIVATION_PATH);
		}

		if (path.startsWith("m/84")) {
			wallet.data().set(WalletData.ImportMethod, WalletImportMethod.BIP84.DERIVATION_PATH);
		}

		wallet.data().set(WalletData.DerivationPath, path);
		wallet.data().set(WalletData.Status, WalletFlag.Cold);

		await wallet.mutator().coin(coin, network);
		await wallet.mutator().address({ address });

		return wallet;
	}

	/** {@inheritDoc IWalletFactory.fromSecret} */
	public async fromSecret({ coin, network, secret, password }: ISecretOptions): Promise<IReadWriteWallet> {
		const wallet: IReadWriteWallet = new Wallet(UUID.random(), {}, this.#profile);

		wallet.data().set(WalletData.ImportMethod, WalletImportMethod.SECRET);
		wallet.data().set(WalletData.Status, WalletFlag.Cold);

		await wallet.mutator().coin(coin, network);
		await wallet.mutator().address(await wallet.coin().address().fromSecret(secret));

		if (password) {
			wallet.data().set(WalletData.ImportMethod, WalletImportMethod.SECRET_WITH_ENCRYPTION);

			await wallet.signingKey().set(secret, password);
		}

		return wallet;
	}

	/** {@inheritDoc IWalletFactory.fromWIF} */
	public async fromWIF({ coin, network, wif, password }: IWifOptions): Promise<IReadWriteWallet> {
		const wallet: IReadWriteWallet = new Wallet(UUID.random(), {}, this.#profile);

		await wallet.mutator().coin(coin, network);
		wallet.data().set(WalletData.Status, WalletFlag.Cold);

		if (password) {
			const { compressed, privateKey } = BIP38.decrypt(wif, password);

			wallet.data().set(WalletData.ImportMethod, WalletImportMethod.WIFWithEncryption);
			wallet.data().set(WalletData.EncryptedSigningKey, BIP38.encrypt(privateKey, password, compressed));

			await wallet.mutator().address(await wallet.coin().address().fromPrivateKey(privateKey));

			const unencryptedWif = (await wallet.coin().wif().fromPrivateKey(privateKey)).wif;
			const { publicKey } = await wallet.coin().publicKey().fromWIF(unencryptedWif);
			wallet.data().set(WalletData.PublicKey, publicKey);
		} else {
			wallet.data().set(WalletData.ImportMethod, WalletImportMethod.WIF);

			await wallet.mutator().address(await wallet.coin().address().fromWIF(wif));

			const { publicKey } = await wallet.coin().publicKey().fromWIF(wif);
			wallet.data().set(WalletData.PublicKey, publicKey);
		}

		return wallet;
	}

	async #fromMnemonicWithDerivative(input: {
		importMethod: string;
		derivationType: string;
		featureFlag: string;
		options: IMnemonicDerivativeOptions;
	}): Promise<IReadWriteWallet> {
		const wallet: IReadWriteWallet = new Wallet(UUID.random(), {}, this.#profile);

		wallet.data().set(WalletData.ImportMethod, input.importMethod);
		wallet.data().set(WalletData.Status, WalletFlag.Cold);

		await wallet.mutator().coin(input.options.coin, input.options.network);

		if (!wallet.gate().allows(input.featureFlag)) {
			throw new Error(`The configured network does not support ${input.derivationType.toUpperCase()}.`);
		}

		if (wallet.network().usesExtendedPublicKey()) {
			if (!input.options.levels) {
				throw new Error("Please specify the levels and try again.");
			}

			wallet.data().set(
				WalletData.Address,
				(
					await wallet
						.coin()
						.address()
						.fromMnemonic(input.options.mnemonic, { [input.derivationType]: input.options.levels })
				).address,
			);

			wallet.data().set(
				WalletData.PublicKey,
				await wallet
					.coin()
					.extendedPublicKey()
					.fromMnemonic(input.options.mnemonic, { [input.derivationType]: input.options.levels }),
			);

			wallet.mutator().avatar(wallet.address());

			wallet.data().set(WalletData.DerivationType, input.derivationType);
		} else {
			await wallet.mutator().identity(input.options.mnemonic, { [input.derivationType]: input.options.levels });
		}

		return wallet;
	}
}
