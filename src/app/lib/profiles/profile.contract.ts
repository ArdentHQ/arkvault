/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Networks } from "@ardenthq/sdk";

import {
	IAppearanceService,
	IAuthenticator,
	ICoinService,
	IContactRepository,
	ICountAggregate,
	IDataRepository,
	IExchangeTransactionRepository,
	IPasswordManager,
	IPluginRepository,
	IPortfolio,
	IProfileAppearance,
	IProfileNotificationService,
	IProfileStatus,
	IRegistrationAggregate,
	ISettingRepository,
	ITransactionAggregate,
	IWalletAggregate,
	IWalletData,
	IWalletFactory,
	IWalletRepository,
} from "./contracts.js";
import { AttributeBag } from "./helpers/attribute-bag.js";
import { IHostRepository } from "./host.repository.contract.js";
import { INetworkRepository } from "./network.repository.contract.js";
import { IPendingMusigWalletRepository } from "./pending-musig-wallet.repository.contract.js";

/**
 *
 *
 * @export
 * @interface IProfileData
 */
export interface IProfileData {
	id: string;
	contacts: Record<string, any>;
	data: Record<string, any>;
	exchangeTransactions: Record<string, any>;
	hosts: Record<string, any>;
	networks: Record<string, any>;
	notifications: Record<string, any>;
	plugins: Record<string, any>;
	settings: Record<string, any>;
	wallets: Record<string, IWalletData>;
	pendingMusigWallets: Record<string, IWalletData>;
}

/**
 *
 *
 * @export
 * @interface IProfileInput
 */
export interface IProfileInput {
	id: string;
	name: string;
	avatar?: string;
	password?: string;
	data: string;
	appearance?: IProfileAppearance;
}

/**
 *
 *
 * @export
 * @interface IWalletExportOptions
 */
export interface IWalletExportOptions {
	excludeEmptyWallets: boolean;
	excludeLedgerWallets: boolean;
	addNetworkInformation: boolean;
}

/**
 *
 *
 * @export
 * @interface IProfileExportOptions
 * @extends {IWalletExportOptions}
 */
export interface IProfileExportOptions extends IWalletExportOptions {
	saveGeneralSettings: boolean;
}

/**
 *
 *
 * @export
 * @interface IProfile
 */
export interface IProfile {
	/**
	 * Get the ID.
	 *
	 * @return {string}
	 * @memberof IProfile
	 */
	id(): string;

	/**
	 * Get the name.
	 *
	 * @return {string}
	 * @memberof IProfile
	 */
	name(): string;

	/**
	 * Get the avatar.
	 *
	 * @return {string}
	 * @memberof IProfile
	 */
	avatar(): string;

	/**
	 * Get the appearance service instance.
	 *
	 * @return {IAppearanceService}
	 * @memberof IProfile
	 */
	appearance(): IAppearanceService;

	/**
	 * Get the balance.
	 *
	 * @return {number}
	 * @memberof IProfile
	 */
	balance(): number;

	/**
	 * Get the converted balance.
	 *
	 * @return {number}
	 * @memberof IProfile
	 */
	convertedBalance(): number;

	/**
	 * Get the coin service instance.
	 *
	 * @return {ICoinService}
	 * @memberof IProfile
	 */
	coins(): ICoinService;

	/**
	 * Get the portfolio service instance.
	 *
	 * @return {IPortfolio}
	 * @memberof IProfile
	 */
	portfolio(): IPortfolio;

	/**
	 * Get the contact repository instance.
	 *
	 * @return {IContactRepository}
	 * @memberof IProfile
	 */
	contacts(): IContactRepository;

	/**
	 * Get the data repository instance.
	 *
	 * @return {IDataRepository}
	 * @memberof IProfile
	 */
	data(): IDataRepository;

	/**
	 * Get the host repository instance.
	 *
	 * @return {IHostRepository}
	 * @memberof IProfile
	 */
	hosts(): IHostRepository;

	/**
	 * Get the network repository instance.
	 *
	 * @return {INetworkRepository}
	 * @memberof IProfile
	 */
	networks(): INetworkRepository;

	/**
	 * Get all available coin networks stored in profile.
	 *
	 * @return {Networks.Network[]}
	 * @memberof IProfile
	 */
	availableNetworks(): Networks.Network[];

	/**
	 * Get the exchange transactions repository instance.
	 *
	 * @return {IExchangeTransactionRepository}
	 * @memberof IProfile
	 */
	exchangeTransactions(): IExchangeTransactionRepository;

	/**
	 * Get the notification service instance.
	 *
	 * @return {IProfileNotificationService}
	 * @memberof IProfile
	 */
	notifications(): IProfileNotificationService;

	/**
	 * Get the plugin repository instance.
	 *
	 * @return {IPluginRepository}
	 * @memberof IProfile
	 */
	plugins(): IPluginRepository;

	/**
	 * Get the setting repository instance.
	 *
	 * @return {ISettingRepository}
	 * @memberof IProfile
	 */
	settings(): ISettingRepository;

	/**
	 * Get the wallet repository instance.
	 *
	 * @return {IWalletRepository}
	 * @memberof IProfile
	 */
	wallets(): IWalletRepository;

	/**
	 * Get the pending musig wallet repository instance.
	 *
	 * @return {IPendingMusigWalletRepository}
	 * @memberof IProfile
	 */
	pendingMusigWallets(): IPendingMusigWalletRepository;

	/**
	 * Access the wallet factory.
	 *
	 * @return {IWalletFactory}
	 * @memberof Profile
	 */
	walletFactory(): IWalletFactory;

	/**
	 * Remove all data and reset the profile.
	 *
	 * @memberof IProfile
	 */
	flush(): void;

	/**
	 * Reset all settings to their defaults.
	 *
	 * @memberof IProfile
	 */
	flushSettings(): void;

	/**
	 * Get the count aggregate instance.
	 *
	 * @return {ICountAggregate}
	 * @memberof IProfile
	 */
	countAggregate(): ICountAggregate;

	/**
	 * Get the registration aggregate instance.
	 *
	 * @return {IRegistrationAggregate}
	 * @memberof IProfile
	 */
	registrationAggregate(): IRegistrationAggregate;

	/**
	 * Get the transaction aggregate instance.
	 *
	 * @return {ITransactionAggregate}
	 * @memberof IProfile
	 */
	transactionAggregate(): ITransactionAggregate;

	/**
	 * Get the wallet aggregate instance.
	 *
	 * @return {IWalletAggregate}
	 * @memberof IProfile
	 */
	walletAggregate(): IWalletAggregate;

	/**
	 * Get the authentication service instance.
	 *
	 * @return {IAuthenticator}
	 * @memberof IProfile
	 */
	auth(): IAuthenticator;

	/**
	 * Get the password service instance.
	 *
	 * @return {IPasswordManager}
	 * @memberof IProfile
	 */
	password(): IPasswordManager;

	/**
	 * Determine if the profile uses a password.
	 *
	 * @return {boolean}
	 * @memberof IProfile
	 */
	usesPassword(): boolean;

	/**
	 * Synchronize the profile.
	 *
	 * @param {Object} [options] - Optional settings for synchronization.
	 * @param {string} [options.networkId]
	 * @param {number} [options.ttl]
	 * @returns {Promise<void>}
	 * @memberof IProfile
	 */
	sync(options?: { networkId?: string; ttl?: number }): Promise<void>;

	/**
	 * Determine if the profile has been partially restored.
	 *
	 * @return {boolean}
	 * @memberof IProfile
	 */
	hasBeenPartiallyRestored(): boolean;

	/**
	 *
	 *
	 * @return {AttributeBag<IProfileInput>}
	 * @memberof IProfile
	 */
	getAttributes(): AttributeBag<IProfileInput>;

	/**
	 * Mark the introductory tutorial as completed.
	 *
	 * @memberof IProfile
	 */
	markIntroductoryTutorialAsComplete(): void;

	/**
	 * Determine if the introductory tutorial has been completed.
	 *
	 * @return {boolean}
	 * @memberof IProfile
	 */
	hasCompletedIntroductoryTutorial(): boolean;

	/**
	 * Mark the "Manual Installation" disclaimer as accepted.
	 *
	 * @memberof IProfile
	 */
	markManualInstallationDisclaimerAsAccepted(): void;

	/**
	 * Determine if the "Manual Installation" disclaimer has been accepted.
	 *
	 * @return {boolean}
	 * @memberof IProfile
	 */
	hasAcceptedManualInstallationDisclaimer(): boolean;

	/**
	 * Get the profile status service instance.
	 *
	 * @memberof IProfile
	 */
	status(): IProfileStatus;
}
