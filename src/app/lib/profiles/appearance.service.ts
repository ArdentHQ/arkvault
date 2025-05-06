import { IAppearanceService, IProfile, IProfileAppearance, ProfileSetting } from "./contracts.js";

export class AppearanceService implements IAppearanceService {
	readonly #profile: IProfile;

	readonly #map: {
		[key in keyof IProfileAppearance]: {
			profileSetting: ProfileSetting;
			defaultValue: IProfileAppearance[key];
		};
	} = {
		theme: {
			defaultValue: "light",
			profileSetting: ProfileSetting.Theme,
		},
		useNetworkWalletNames: {
			defaultValue: false,
			profileSetting: ProfileSetting.UseNetworkWalletNames,
		},
	};

	public constructor(profile: IProfile) {
		this.#profile = profile;
	}

	/** {@inheritDoc IAppearanceService.all} */
	public all(): IProfileAppearance {
		const all = {};

		for (const key of Object.keys(this.#map)) {
			all[key] = this.get(key as keyof IProfileAppearance);
		}

		return all as IProfileAppearance;
	}

	/** {@inheritDoc IAppearanceService.get} */
	public get<T extends keyof IProfileAppearance>(key: T): IProfileAppearance[T] {
		if (!this.#map[key]) {
			throw new Error(`Parameter "key" must be one of: ${Object.keys(this.#map).join(", ")}`);
		}

		const { profileSetting, defaultValue } = this.#map[key];

		if (this.#profile.settings().missing(profileSetting)) {
			return this.#profile.getAttributes().get(`appearance.${key}`) ?? defaultValue;
		}

		return this.#profile.settings().get(profileSetting)!;
	}

	/** {@inheritDoc IAppearanceService.defaults} */
	public defaults(): IProfileAppearance {
		const defaults = {};

		for (const key of Object.keys(this.#map)) {
			defaults[key] = this.#map[key as keyof IProfileAppearance].defaultValue;
		}

		return defaults as IProfileAppearance;
	}
}
