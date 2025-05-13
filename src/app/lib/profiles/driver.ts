import { Coins, Helpers, IoC, Networks } from "@/app/lib/sdk";

import { Identifiers } from "./container.models.js";
import { EnvironmentOptions, NetworkHostSelectorFactory } from "./environment.models.js";
import { IProfile } from "./profile.contract.js";
import { ProfileSetting } from "./profile.enum.contract.js";
import { ExchangeRateService } from "./exchange-rate.service.js";

export const defaultHostSelector: NetworkHostSelectorFactory =
	(profile: IProfile) => (configRepository: Coins.ConfigRepository, type?: Networks.NetworkHostType) => {
		type ??= "full";

		const defaultHosts = Helpers.filterHostsFromConfig(configRepository, type);
		const customHosts = profile
			.hosts()
			.allByNetwork(configRepository.get("network.id"))
			.map(({ host }) => host)
			.filter(({ custom, enabled, type: hostType }) => custom && enabled && hostType === type);

		if (customHosts.length === 0) {
			return Helpers.randomHost(defaultHosts, type);
		}

		if (profile.settings().get(ProfileSetting.FallbackToDefaultNodes)) {
			const customHost = Helpers.randomHost(customHosts, type);

			if (!customHost.failedCount || customHost.failedCount < 3) {
				return customHost;
			}

			return Helpers.randomHost(
				defaultHosts.filter(({ custom }) => !custom),
				type,
			);
		}

		return Helpers.randomHost(customHosts, type);
	};

export class DriverFactory {
	public static make(container: IoC.Container, options: EnvironmentOptions): void {
		container.constant(Identifiers.HttpClient, options.httpClient);

		container.singleton(Identifiers.ExchangeRateService, ExchangeRateService);
	}
}
