import { Networks } from "@/app/lib/sdk";
import Joi from "joi";

import { container } from "./container.js";
import { Identifiers } from "./container.models.js";
import {
	IDataRepository,
	IExchangeRateService,
	IFeeService,
	IProfile,
	IProfileRepository,
	IWalletService,
} from "./contracts.js";
import { defaultHostSelector, DriverFactory } from "./driver.js";
import { EnvironmentOptions, Storage, StorageData } from "./environment.models.js";
import { KnownWalletService } from "./known-wallet.service.js";
import { StorageFactory } from "./factory.storage.js";
import { DataRepository } from "./repositories.js";
import { ProfileFeeService } from "./fee.service.js";
import { ProfileRepository } from "./profile.repository.js";
import { WalletService } from "./wallet.service.js";

export class Environment {
	#storage: Storage;
	#knownWalletService: KnownWalletService;
	#data: DataRepository;
	#fees: ProfileFeeService;
	#profiles: ProfileRepository;
	#wallets: WalletService;

	public constructor(options: EnvironmentOptions) {
		DriverFactory.make(container, options);

		this.#data = new DataRepository();
		this.#fees = new ProfileFeeService();
		this.#profiles = new ProfileRepository();
		this.#knownWalletService = new KnownWalletService();
		this.#wallets = new WalletService();

		if (typeof options.storage === "string") {
			this.#storage = StorageFactory.make(options.storage);
		} else {
			this.#storage = options.storage;
		}
	}

	/**
	 * Verify the integrity of the storage.
	 *
	 * @returns {Promise<void>}
	 * @memberof Environment
	 */
	public async verify(storageData?: StorageData): Promise<void> {
		const storage = storageData ?? await this.#storage.all<StorageData>();

		const data: object = storage.data || {};
		const profiles: object = storage.profiles || {};

		const { error, value } = Joi.object({
			data: Joi.object().required(),
			profiles: Joi.object().pattern(Joi.string().uuid(), Joi.object()).required(),
		}).validate({ data, profiles }, { allowUnknown: true, stripUnknown: true });

		if (error) {
			throw new Error(`Terminating due to corrupted state: ${String(error)}`);
		}

		this.#storage.set("data", value.data);
		this.#storage.set("profiles", value.profiles);
	}

	/**
	 * Load the data from the storage.
	 *
	 * This has to be manually called and should always be called before booting
	 * of the environment instance. This will generally be only called on application start.
	 *
	 * @returns {Promise<void>}
	 * @memberof Environment
	 */
	public async boot(): Promise<void> {
		if (this.#storage === undefined) {
			throw new Error("Please call [verify] before booting the environment.");
		}

		const storage = await this.#storage.all<StorageData>()

		if (Object.keys(storage.data).length > 0) {
			this.data().fill(storage.data);
		}

		if (Object.keys(storage.profiles).length > 0) {
			this.profiles().fill(storage.profiles);
		}

		/* istanbul ignore next */
		if (container.has(Identifiers.ExchangeRateService)) {
			await container.get<IExchangeRateService>(Identifiers.ExchangeRateService).restore();
		}
	}

	/**
	 * Save the data to the storage.
	 *
	 * This has to be manually called and should always be called before disposing
	 * of the environment instance. For example on application shutdown or when switching profiles.
	 *
	 * @returns {Promise<void>}
	 * @memberof Environment
	 */
	public async persist(): Promise<void> {
		for (const profile of this.profiles().values()) {
			await this.profiles().persist(profile);
		}

		await this.#storage.set("profiles", this.profiles().toObject());

		await this.#storage.set("data", this.data().all());
	}

	/**
	 * Access the application data.
	 *
	 * @returns {DataRepository}
	 * @memberof Environment
	 */
	public data(): IDataRepository {
		return this.#data;
	}

	/**
	 * Access the exchange rate service.
	 *
	 * @returns {ExchangeRateService}
	 * @memberof Environment
	 */
	public exchangeRates(): IExchangeRateService {
		return container.get(Identifiers.ExchangeRateService);
	}

	/**
	 * Access the fees service.
	 *
	 * @returns {FeeService}
	 * @memberof Environment
	 */
	public fees(): IFeeService {
		return this.#fees;
	}

	/**
	 * Access the known wallets service.
	 *
	 * @returns {KnownWalletService}
	 * @memberof Environment
	 */
	public knownWallets(): KnownWalletService {
		return this.#knownWalletService;
	}

	/**
	 * Access the profile repository.
	 *
	 * @returns {ProfileRepository}
	 * @memberof Environment
	 */
	public profiles(): IProfileRepository {
		return this.#profiles;
	}

	/**
	 * Access the wallet service.
	 *
	 * @returns {WalletService}
	 * @memberof Environment
	 */
	public wallets(): IWalletService {
		return this.#wallets;
	}

	/**
	 * Remove all bindings from the container and optionally rebind them.
	 *
	 * @memberof Environment
	 */
	public reset(options?: EnvironmentOptions): void {
		container.flush();

		if (options !== undefined) {
			DriverFactory.make(container, options);
		}
	}

	/**
	 * Set the migrations that should be used for profiles, if applicable.
	 *
	 * @param {object} schemas
	 * @param {string} version
	 * @memberof Environment
	 */
	public setMigrations(schemas: object, version: string): void {
		container.constant(Identifiers.MigrationSchemas, schemas);
		container.constant(Identifiers.MigrationVersion, version);
	}

	/**
	 * Get the host selector function.
	 *
	 * @returns {Function}
	 * @memberof Environment
	 */
	public hostSelector(profile: IProfile): Networks.NetworkHostSelector {
		return defaultHostSelector(profile);
	}
}
