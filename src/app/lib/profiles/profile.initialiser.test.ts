import { describe, expect, it, vi, beforeEach } from "vitest";
import { IProfile, ProfileSetting } from "./contracts";
import { ProfileInitialiser } from "./profile.initialiser";
import { env, getMainsailProfileId } from "@/utils/testing-library";

describe("ProfileInitialiser", () => {
	let profile: IProfile;
	let subject: ProfileInitialiser;

	beforeEach(() => {
		profile = env.profiles().findById(getMainsailProfileId());
		subject = new ProfileInitialiser(profile);
	});

	it("should initialise the profile", () => {
		const flushContacts = vi.spyOn(profile.contacts(), "flush");
		const flushData = vi.spyOn(profile.data(), "flush");
		const flushExchangeTransactions = vi.spyOn(profile.exchangeTransactions(), "flush");
		const flushNotifications = vi.spyOn(profile.notifications(), "flush");
		const flushSettings = vi.spyOn(profile.settings(), "flush");
		const flushWallets = vi.spyOn(profile.wallets(), "flush");
		const initialiseSettings = vi.spyOn(subject, "initialiseSettings");

		subject.initialise("new name");

		expect(flushContacts).toHaveBeenCalled();
		expect(flushData).toHaveBeenCalled();
		expect(flushExchangeTransactions).toHaveBeenCalled();
		expect(flushNotifications).toHaveBeenCalled();
		expect(flushSettings).toHaveBeenCalled();
		expect(flushWallets).toHaveBeenCalled();
		expect(initialiseSettings).toHaveBeenCalledWith("new name");
	});

	it("should initialise the settings", () => {
		const markAsDirty = vi.spyOn(profile.status(), "markAsDirty");

		subject.initialiseSettings("new name");

		expect(markAsDirty).toHaveBeenCalled();
		expect(profile.settings().get(ProfileSetting.Name)).toBe("new name");
		expect(profile.settings().get(ProfileSetting.AutomaticSignOutPeriod)).toBe(15);
		expect(profile.settings().get(ProfileSetting.Bip39Locale)).toBe("english");
		expect(profile.settings().get(ProfileSetting.DoNotShowFeeWarning)).toBe(false);
		expect(profile.settings().get(ProfileSetting.FallbackToDefaultNodes)).toBe(true);
		expect(profile.settings().get(ProfileSetting.ExchangeCurrency)).toBe("BTC");
		expect(profile.settings().get(ProfileSetting.Locale)).toBe("en-US");
		expect(profile.settings().get(ProfileSetting.MarketProvider)).toBe("cryptocompare");
		expect(profile.settings().get(ProfileSetting.Theme)).toBe("light");
		expect(profile.settings().get(ProfileSetting.TimeFormat)).toBe("h:mm A");
		expect(profile.settings().get(ProfileSetting.UseNetworkWalletNames)).toBe(false);
		expect(profile.settings().get(ProfileSetting.UseTestNetworks)).toBe(false);
	});
});
