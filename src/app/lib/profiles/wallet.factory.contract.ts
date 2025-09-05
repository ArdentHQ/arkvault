import { Services } from "@/app/lib/mainsail";

import { IReadWriteWallet } from "./contracts.js";

/**
 * Defines the options needed to generate a wallet.
 *
 * @interface IGenerateOptions
 */
export interface IGenerateOptions {
	locale?: string;
	wordCount?: number;
	withPublicKey?: boolean;
}

/**
 * Defines the options needed to generate a wallet.
 *
 * @type IGenerateHDOptions
 */
export type IGenerateHDOptions = IGenerateOptions & {
	coin?: BIP44CoinType;
	mnemonic?: string;
	levels: Services.IdentityLevels;
};

/**
 * Defines the options for an import with a mnemonic.
 *
 * @interface IMnemonicOptions
 */
export interface IMnemonicOptions {
	mnemonic: string;
	password?: string;
}

export enum BIP44CoinType {
	ARK = "111'",
	ETH = "60'",
}

export interface IMnemonicDerivativeOptions extends IMnemonicOptions {
	levels: Services.IdentityLevels;
	coin?: BIP44CoinType;
}

/**
 * Defines the options for an import with an address.
 *
 * @interface IAddressOptions
 */
export interface IAddressOptions {
	address: string;
}

/**
 * Defines the options for an import with a public key.
 *
 * @interface IPublicKeyOptions
 */
export interface IPublicKeyOptions {
	publicKey: string;
	bip44?: Services.IdentityLevels;
	bip49?: Services.IdentityLevels;
	bip84?: Services.IdentityLevels;
}

/**
 * Defines the options for an import with a private key.
 *
 * @interface IPrivateKeyOptions
 */
export interface IPrivateKeyOptions {
	privateKey: string;
}

/**
 * Defines the options for an import with a BIP44 path.
 *
 * @interface IAddressWithDerivationPathOptions
 */
export interface IAddressWithDerivationPathOptions {
	address: string;
	path: string;
}

/**
 * Defines the options for an import with a secret.
 *
 * @interface ISecretOptions
 */
export interface ISecretOptions {
	secret: string;
	password?: string;
}

/**
 * Defines the options for an import with a WIF.
 *
 * @interface IWifOptions
 */
export interface IWifOptions {
	wif: string;
	password?: string;
}

/**
 * Defines the implementation contract for the wallet factory.
 *
 * @export
 * @interface IWalletFactory
 */
export interface IWalletFactory {
	/**
	 * Generates a wallet from a mnemonic.
	 *
	 * @param {IGenerateOptions} options
	 * @return {Promise<{ mnemonic: string; wallet: IReadWriteWallet }>}
	 * @memberof IWalletFactory
	 */
	generate(options?: IGenerateOptions): Promise<{ mnemonic: string; wallet: IReadWriteWallet }>;

	generateHD(options?: IGenerateHDOptions): Promise<{ mnemonic: string; wallet: IReadWriteWallet }>;

	/**
	 * Imports a wallet from a mnemonic, using the BIP39 proposal.
	 *
	 * @param {IMnemonicOptions} options
	 * @return {Promise<IReadWriteWallet>}
	 * @memberof IWalletFactory
	 */
	fromMnemonicWithBIP39(options: IMnemonicOptions): Promise<IReadWriteWallet>;

	/**
	 * Imports a wallet from a mnemonic, using the BIP44 proposal.
	 *
	 * @param {IMnemonicDerivativeOptions} options
	 * @return {Promise<IReadWriteWallet>}
	 * @memberof IWalletFactory
	 */
	fromMnemonicWithBIP44(options: IMnemonicDerivativeOptions): Promise<IReadWriteWallet>;

	/**
	 * Imports a wallet from a mnemonic, using the BIP49 proposal.
	 *
	 * @param {IMnemonicDerivativeOptions} options
	 * @return {Promise<IReadWriteWallet>}
	 * @memberof IWalletFactory
	 */
	fromMnemonicWithBIP49(options: IMnemonicDerivativeOptions): Promise<IReadWriteWallet>;

	/**
	 * Imports a wallet from a mnemonic, using the BIP84 proposal.
	 *
	 * @param {IMnemonicDerivativeOptions} options
	 * @return {Promise<IReadWriteWallet>}
	 * @memberof IWalletFactory
	 */
	fromMnemonicWithBIP84(options: IMnemonicDerivativeOptions): Promise<IReadWriteWallet>;

	/**
	 * Imports a wallet from an address.
	 *
	 * @param {IAddressOptions} options
	 * @return {Promise<IReadWriteWallet>}
	 * @memberof IWalletFactory
	 */
	fromAddress(options: IAddressOptions): Promise<IReadWriteWallet>;

	/**
	 * Imports a wallet from a public key.
	 *
	 * @param {IPublicKeyOptions} options
	 * @return {Promise<IReadWriteWallet>}
	 * @memberof IWalletFactory
	 */
	fromPublicKey(options: IPublicKeyOptions): Promise<IReadWriteWallet>;

	/**
	 * Imports a wallet from a private key.
	 *
	 * @param {IPrivateKeyOptions} options
	 * @return {Promise<IReadWriteWallet>}
	 * @memberof IWalletFactory
	 */
	fromPrivateKey(options: IPrivateKeyOptions): Promise<IReadWriteWallet>;

	/**
	 * Imports a wallet from a BIP44 path.
	 *
	 * @param {IAddressWithDerivationPathOptions} options
	 * @return {Promise<IReadWriteWallet>}
	 * @memberof IWalletFactory
	 */
	fromAddressWithDerivationPath(options: IAddressWithDerivationPathOptions): Promise<IReadWriteWallet>;

	/**
	 * Imports a wallet from a secret.
	 *
	 * @param {ISecretOptions} options
	 * @return {Promise<IReadWriteWallet>}
	 * @memberof IWalletFactory
	 */
	fromSecret(options: ISecretOptions): Promise<IReadWriteWallet>;
}
