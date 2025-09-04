import { Enums } from "@/app/lib/mainsail";
import { BIP39, UUID } from "@ardenthq/arkvault-crypto";
import {
	IAddressOptions,
	IAddressWithDerivationPathOptions,
	IGenerateHDOptions,
	IGenerateOptions,
	IMnemonicOptions,
	IPrivateKeyOptions,
	IProfile,
	IPublicKeyOptions,
	IReadWriteWallet,
	IWalletFactory,
	WalletData,
	WalletImportMethod,
} from "./contracts.js";
import { WalletFlag } from "./wallet.enum.js";
import { IMnemonicDerivativeOptions, ISecretOptions } from "./wallet.factory.contract.js";
import { Wallet } from "./wallet.js";
import { PublicKeyService } from "@/app/lib/mainsail/public-key.service";
import { AddressService } from "@/app/lib/mainsail/address.service";
import { hdKeyToAccount, HDKey } from "viem/accounts";

export class WalletFactory implements IWalletFactory {
	readonly #profile: IProfile;

	public constructor(profile: IProfile) {
		this.#profile = profile;
	}

	/** {@inheritDoc IWalletFactory.generate} */
	public async generate({
		locale,
		wordCount,
		withPublicKey,
	}: IGenerateOptions): Promise<{ mnemonic: string; wallet: IReadWriteWallet }> {
		const mnemonic: string = BIP39.generate(locale, wordCount);

		const wallet = await this.fromMnemonicWithBIP39({ mnemonic });

		if (withPublicKey) {
			const value = new PublicKeyService().fromMnemonic(mnemonic);
			wallet.data().set(WalletData.PublicKey, value.publicKey);
		}

		return { mnemonic, wallet };
	}

	/** {@inheritDoc IWalletFactory.generateHD} */
	public async generateHD({
		locale,
		wordCount,
		coin,
		accountIndex = 0,
		changeIndex = 0,
	}: Pick<IGenerateHDOptions, "locale" | "wordCount" | "coin" | "accountIndex" | "changeIndex">): Promise<{
		mnemonic: string;
		wallet: IReadWriteWallet;
	}> {
		const mnemonic: string = BIP39.generate(locale, wordCount);

		// Generate HD wallet with specified indices
		const wallet = await this.#createHDWallet({
			accountIndex,
			changeIndex,
			coin,
			mnemonic,
		});

		return { mnemonic, wallet };
	}

	/** Import HD wallet from existing mnemonic */
	public async importHD({
		mnemonic,
		accountIndex = 0,
		coin,
		changeIndex = 0,
		addressIndex = 0,
	}: Omit<IGenerateHDOptions, "locale" | "wordCount">): Promise<IReadWriteWallet> {
		return this.#createHDWallet({
			accountIndex,
			addressIndex,
			changeIndex,
			coin,
			mnemonic,
		});
	}

	async #createHDWallet({
		mnemonic,
		accountIndex = 0,
		coin,
		changeIndex = 0,
		addressIndex = 0,
	}: Omit<IGenerateHDOptions, "locale" | "wordCount">): Promise<IReadWriteWallet> {
		// Determine coin type - default to ARK (111)
		const coinType = coin === "ETH" ? "60'" : "111'";

		const derivationPath = `m/44'/${coinType}/${accountIndex}'/${changeIndex}/${addressIndex}`;

		const seed = BIP39.toSeed(mnemonic!);

		const hdKey = HDKey.fromMasterSeed(seed);
		const account = hdKeyToAccount(hdKey, {
			path: derivationPath!,
		});

		const wallet: IReadWriteWallet = new Wallet(UUID.random(), {}, this.#profile);

		wallet.data().set(WalletData.DerivationPath, derivationPath);
		wallet.data().set(WalletData.ImportMethod, WalletImportMethod.BIP44.DERIVATION_PATH);
		wallet.data().set(WalletData.AddressIndex, addressIndex);

		await wallet.mutator().address({ address: account.address });

		return wallet;
	}

	/** {@inheritDoc IWalletFactory.fromMnemonicWithBIP39} */
	public async fromMnemonicWithBIP39({ mnemonic, password }: IMnemonicOptions): Promise<IReadWriteWallet> {
		const wallet: IReadWriteWallet = new Wallet(UUID.random(), {}, this.#profile);

		wallet.data().set(WalletData.ImportMethod, WalletImportMethod.BIP39.MNEMONIC);
		wallet.data().set(WalletData.Status, WalletFlag.Cold);

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
	public async fromAddress({ address }: IAddressOptions): Promise<IReadWriteWallet> {
		const wallet: IReadWriteWallet = new Wallet(UUID.random(), {}, this.#profile);
		wallet.data().set(WalletData.ImportMethod, WalletImportMethod.Address);
		wallet.data().set(WalletData.Status, WalletFlag.Cold);

		await wallet.mutator().address({ address });

		return wallet;
	}

	/** {@inheritDoc IWalletFactory.fromPublicKey} */
	public async fromPublicKey({ publicKey }: IPublicKeyOptions): Promise<IReadWriteWallet> {
		const wallet: IReadWriteWallet = new Wallet(UUID.random(), {}, this.#profile);
		wallet.data().set(WalletData.ImportMethod, WalletImportMethod.PublicKey);
		wallet.data().set(WalletData.PublicKey, publicKey);
		wallet.data().set(WalletData.Status, WalletFlag.Cold);

		await wallet.mutator().address(new AddressService().fromPublicKey(publicKey));

		return wallet;
	}

	/** {@inheritDoc IWalletFactory.fromPrivateKey} */
	public async fromPrivateKey({ privateKey }: IPrivateKeyOptions): Promise<IReadWriteWallet> {
		const wallet: IReadWriteWallet = new Wallet(UUID.random(), {}, this.#profile);
		wallet.data().set(WalletData.ImportMethod, WalletImportMethod.PrivateKey);
		wallet.data().set(WalletData.Status, WalletFlag.Cold);

		await wallet.mutator().address(new AddressService().fromPrivateKey(privateKey));

		return wallet;
	}

	/** {@inheritDoc IWalletFactory.fromAddressWithDerivationPath} */
	public async fromAddressWithDerivationPath({
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

		await wallet.mutator().address({ address });

		return wallet;
	}

	/** {@inheritDoc IWalletFactory.fromSecret} */
	public async fromSecret({ secret, password }: ISecretOptions): Promise<IReadWriteWallet> {
		const wallet: IReadWriteWallet = new Wallet(UUID.random(), {}, this.#profile);

		wallet.data().set(WalletData.ImportMethod, WalletImportMethod.SECRET);
		wallet.data().set(WalletData.Status, WalletFlag.Cold);

		await wallet.mutator().address(new AddressService().fromSecret(secret));

		if (password) {
			wallet.data().set(WalletData.ImportMethod, WalletImportMethod.SECRET_WITH_ENCRYPTION);

			await wallet.signingKey().set(secret, password);
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

		if (!wallet.gate().allows(input.featureFlag)) {
			throw new Error(`The configured network does not support ${input.derivationType.toUpperCase()}.`);
		}

		if (wallet.network().usesExtendedPublicKey()) {
			//if (!input.options.levels) {
			//	throw new Error("Please specify the levels and try again.");
			//}
			//
			//const walletData = await wallet
			//	.coin()
			//	.address()
			//	.fromMnemonic(input.options.mnemonic, { [input.derivationType]: input.options.levels });
			//
			//wallet.data().set(WalletData.Address, walletData.address);
			//
			//wallet.data().set(
			//	WalletData.PublicKey,
			//	await wallet
			//		.coin()
			//		.extendedPublicKey()
			//		.fromMnemonic(input.options.mnemonic, { [input.derivationType]: input.options.levels }),
			//);
			//
			//wallet.mutator().avatar(wallet.address());
			//
			//wallet.data().set(WalletData.DerivationType, input.derivationType);
		} else {
			await wallet.mutator().identity(input.options.mnemonic);
		}

		return wallet;
	}
}
