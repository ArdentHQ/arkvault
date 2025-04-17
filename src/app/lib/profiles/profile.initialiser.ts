import { IProfile, IProfileInitialiser, ProfileSetting } from "./contracts.js";

export class ProfileInitialiser implements IProfileInitialiser {
	readonly #profile: IProfile;

	public constructor(profile: IProfile) {
		this.#profile = profile;
	}

	/** {@inheritDoc IProfileInitialiser.initialise} */
	public initialise(name: string): void {
		// Flush services
		this.#profile.contacts().flush();
		this.#profile.data().flush();
		this.#profile.exchangeTransactions().flush();
		this.#profile.notifications().flush();
		this.#profile.plugins().flush();
		this.#profile.settings().flush();
		this.#profile.wallets().flush();

		// Default Settings
		this.initialiseSettings(name);
	}

	/** {@inheritDoc IProfileInitialiser.initialiseSettings} */
	public initialiseSettings(name: string): void {
		const { theme, useNetworkWalletNames } = this.#profile.appearance().defaults();

		this.#profile.settings().set(ProfileSetting.AutomaticSignOutPeriod, 15);
		this.#profile.settings().set(ProfileSetting.Bip39Locale, "english");
		this.#profile.settings().set(ProfileSetting.DoNotShowFeeWarning, false);
		this.#profile.settings().set(ProfileSetting.FallbackToDefaultNodes, true);
		this.#profile.settings().set(ProfileSetting.ExchangeCurrency, "BTC");
		this.#profile.settings().set(ProfileSetting.Locale, "en-US");
		this.#profile.settings().set(ProfileSetting.MarketProvider, "cryptocompare");
		this.#profile.settings().set(ProfileSetting.Name, name);
		this.#profile.settings().set(ProfileSetting.Theme, theme);
		this.#profile.settings().set(ProfileSetting.TimeFormat, "h:mm A");
		this.#profile.settings().set(ProfileSetting.UseNetworkWalletNames, useNetworkWalletNames);
		this.#profile.settings().set(ProfileSetting.UseTestNetworks, false);

		this.#profile.status().markAsDirty();
	}
}
