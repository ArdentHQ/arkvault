import { get, has, set, unset, ValidatorSchema } from "@/app/lib/helpers";
import { defaultHostSelector } from "@/app/lib/profiles/driver";
import { IProfile } from "@/app/lib/profiles/profile.contract";

export class ConfigRepository {
	readonly #config: Record<string, any>;

	public constructor(config: object) {
		const { error, value } = ValidatorSchema.object({
			// @TODO: ADD network field validation.
			network: ValidatorSchema.object(),
		}).validate(config);

		if (error !== undefined) {
			throw new Error(`Failed to validate the configuration: ${(error as any).message}`);
		}

		this.#config = value;
	}

	public all(): Record<string, any> {
		return this.#config;
	}

	public get<T>(key: string, defaultValue?: T): T {
		const value: T | undefined = get(this.#config, key, defaultValue);

		if (value === undefined) {
			throw new Error(`The [${key}] is an unknown configuration value.`);
		}

		return value;
	}

	public getLoose<T>(key: string, defaultValue?: T): T | undefined {
		return get(this.#config, key, defaultValue);
	}

	public set(key: string, value: unknown): void {
		set(this.#config, key, value);
	}

	public has(key: string): boolean {
		return has(this.#config, key);
	}

	public missing(key: string): boolean {
		return !this.has(key);
	}

	public forget(key: string): boolean {
		return unset(this.#config, key);
	}

	public host(type: HostType, profile: IProfile): string {
		const hostSelector = defaultHostSelector(profile);
		const { host } = hostSelector(this, type);
		return host;
	}
}

export type HostType = "full" | "tx" | "explorer" | "evm";

export enum ConfigKey {
	Bech32 = "network.constants.bech32",
	CurrencyDecimals = "network.currency.decimals",
	CurrencyTicker = "network.currency.ticker",
	Epoch = "network.constants.epoch",
	KnownWallets = "network.knownWallets",
	Network = "network",
	NetworkId = "network.id",
	NetworkType = "network.type",
	Slip44 = "network.constants.slip44",
	Wif = "network.meta.wif",
}
