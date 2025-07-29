import { get, has, set, unset, ValidatorSchema } from "@/app/lib/helpers";
import { IProfile } from "@/app/lib/profiles/profile.contract";
import { NetworkHostSelectorFactory } from "@/app/lib/profiles";
import { Networks } from ".";
import { ProfileSetting } from "@/app/lib/profiles/profile.enum.contract";
import { filterHostsFromConfig, randomHost } from "./helpers/hosts";

export const hostSelector: NetworkHostSelectorFactory =
	(profile: IProfile) => (configRepository: ConfigRepository, type?: Networks.NetworkHostType) => {
		type ??= "full";

		const defaultHosts = filterHostsFromConfig(configRepository, type);
		const customHosts = profile
			.hosts()
			.allByNetwork(configRepository.get("network.id"))
			.map(({ host }) => host)
			.filter(({ custom, enabled, type: hostType }) => custom && enabled && hostType === type);

		if (customHosts.length === 0) {
			return randomHost(defaultHosts, type);
		}

		if (profile.settings().get(ProfileSetting.FallbackToDefaultNodes)) {
			const customHost = randomHost(customHosts, type);

			if (!customHost.failedCount || customHost.failedCount < 3) {
				return customHost;
			}

			return randomHost(
				defaultHosts.filter(({ custom }) => !custom),
				type,
			);
		}

		return randomHost(customHosts, type);
	};

export class ConfigRepository {
	readonly #config: Record<string, any>;

	public constructor(config: object) {
		const { error, value } = ValidatorSchema.object({
			// @TODO: ADD network field validation.
			crypto: ValidatorSchema.object().optional(),
			height: ValidatorSchema.number().optional(),
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
		const { host } = hostSelector(profile)(this, type);
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
