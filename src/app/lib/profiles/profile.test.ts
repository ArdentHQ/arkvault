import { describe, expect, it, beforeEach, vi } from "vitest";
import { IProfile, ProfileData, ProfileSetting } from "./contracts";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { AppearanceService } from "./appearance.service";
import { Authenticator } from "./authenticator";
import { ContactRepository } from "./contact.repository";
import { CountAggregate } from "./count.aggregate";
import { DataRepository } from "./data.repository";
import { ExchangeTransactionRepository } from "./exchange-transaction.repository";
import { HostRepository } from "./host.repository";
import { NetworkRepository } from "./network.repository";
import { ProfileNotificationService } from "./notification.service";
import { PasswordManager } from "./password";
import { ProfileStatus } from "./profile.status";
import { RegistrationAggregate } from "./registration.aggregate";
import { SettingRepository } from "./setting.repository";
import { TransactionAggregate } from "./transaction.aggregate";
import { WalletAggregate } from "./wallet.aggregate";
import { WalletFactory } from "./wallet.factory";
import { WalletRepository } from "./wallet.repository";
import { AttributeBag } from "./helpers/attribute-bag";
import { UsernamesService } from "./usernames.service";
import { ValidatorService } from "./validator.service";
import { LedgerService } from "@/app/lib/mainsail/ledger.service";
import { KnownWalletService } from "./known-wallet.service";
import { ExchangeRateService } from "./exchange-rate.service";
import * as ProfileInitialiserModule from "./profile.initialiser";

describe("Profile", () => {
	let profile: IProfile;

	beforeEach(() => {
		profile = env.profiles().findById(getMainsailProfileId());

		vi.restoreAllMocks();
	});

	it("should have an id", () => {
		expect(profile.id()).toBe("877b7695-8a55-4e16-a7ff-412113131856");
	});

	it("should have a name", () => {
		expect(profile.name()).toBe("Foo Bar");
	});

	it("should have an avatar", () => {
		profile.settings().forget(ProfileSetting.Avatar);
		expect(profile.avatar()).toMatch(/<svg/);
	});

	it("should have an appearance service", () => {
		expect(profile.appearance()).toBeInstanceOf(AppearanceService);
	});

	it("should have a balance", () => {
		const spy = vi.spyOn(profile.walletAggregate(), "balance").mockReturnValue(123);
		expect(profile.balance()).toBe(123);
		spy.mockRestore();
	});

	it("should have a converted balance", () => {
		const spy = vi.spyOn(profile.walletAggregate(), "convertedBalance").mockReturnValue(456);
		expect(profile.convertedBalance()).toBe(456);
		spy.mockRestore();
	});

	it("should flush the profile", () => {
		const spy = vi.spyOn(ProfileInitialiserModule, "ProfileInitialiser").mockImplementation(
			() =>
				({
					initialise: () => {
						//
					},
				}) as any,
		);

		profile.flush();

		expect(spy).toHaveBeenCalled();
	});

	it("should throw if the name is missing when flushing", () => {
		profile.settings().forget(ProfileSetting.Name);
		expect(() => profile.flush()).toThrow("The name of the profile could not be found. This looks like a bug.");
	});

	it("should flush the settings of the profile", () => {
		const initialiseSettingsSpy = vi.fn();
		const spy = vi.spyOn(ProfileInitialiserModule, "ProfileInitialiser").mockImplementation(
			() =>
				({
					initialiseSettings: initialiseSettingsSpy,
				}) as any,
		);
		profile.settings().set(ProfileSetting.Name, "Test Profile");
		profile.flushSettings();

		expect(spy).toHaveBeenCalled();
		expect(initialiseSettingsSpy).toHaveBeenCalledWith("Test Profile");
	});

	it("should throw if the name is missing when flushing settings", () => {
		profile.settings().forget(ProfileSetting.Name);
		expect(() => profile.flushSettings()).toThrow(
			"The name of the profile could not be found. This looks like a bug.",
		);
	});

	it("should have a contact repository", () => {
		expect(profile.contacts()).toBeInstanceOf(ContactRepository);
	});

	it("should have a data repository", () => {
		expect(profile.data()).toBeInstanceOf(DataRepository);
	});

	it("should have a host repository", () => {
		expect(profile.hosts()).toBeInstanceOf(HostRepository);
	});

	it("should have a network repository", () => {
		expect(profile.networks()).toBeInstanceOf(NetworkRepository);
	});

	it("should have available networks", () => {
		expect(Array.isArray(profile.availableNetworks())).toBe(true);
		expect(profile.availableNetworks().length).toBeGreaterThan(0);
	});

	it("should have an active network", () => {
		expect(profile.activeNetwork()).toBeDefined();
	});

	it("should have an exchange transaction repository", () => {
		expect(profile.exchangeTransactions()).toBeInstanceOf(ExchangeTransactionRepository);
	});

	it("should have a notification service", () => {
		expect(profile.notifications()).toBeInstanceOf(ProfileNotificationService);
	});

	it("should have a setting repository", () => {
		expect(profile.settings()).toBeInstanceOf(SettingRepository);
	});

	it("should have a wallet repository", () => {
		expect(profile.wallets()).toBeInstanceOf(WalletRepository);
	});

	it("should have a wallet factory", () => {
		expect(profile.walletFactory()).toBeInstanceOf(WalletFactory);
	});

	it("should have a count aggregate", () => {
		expect(profile.countAggregate()).toBeInstanceOf(CountAggregate);
	});

	it("should have a registration aggregate", () => {
		expect(profile.registrationAggregate()).toBeInstanceOf(RegistrationAggregate);
	});

	it("should have a transaction aggregate", () => {
		expect(profile.transactionAggregate()).toBeInstanceOf(TransactionAggregate);
	});

	it("should have a wallet aggregate", () => {
		expect(profile.walletAggregate()).toBeInstanceOf(WalletAggregate);
	});

	it("should have an authenticator", () => {
		expect(profile.auth()).toBeInstanceOf(Authenticator);
	});

	it("should have a password manager", () => {
		expect(profile.password()).toBeInstanceOf(PasswordManager);
	});

	it("should have a status", () => {
		expect(profile.status()).toBeInstanceOf(ProfileStatus);
	});

	it("should check if it uses a password", () => {
		expect(profile.usesPassword()).toBe(false);
	});

	it("should check if it has been partially restored", () => {
		expect(profile.hasBeenPartiallyRestored()).toBe(false);
	});

	it("should return true if at least one wallet has been partially restored", () => {
		const wallet = { hasBeenPartiallyRestored: () => true };
		const walletsSpy = vi.spyOn(profile.wallets(), "values").mockReturnValue([wallet as any]);

		expect(profile.hasBeenPartiallyRestored()).toBe(true);

		walletsSpy.mockRestore();
	});

	it("should have attributes", () => {
		expect(profile.getAttributes()).toBeInstanceOf(AttributeBag);
	});

	it("should have a username service", () => {
		expect(profile.usernames()).toBeInstanceOf(UsernamesService);
	});

	it("should have a validator service", () => {
		expect(profile.validators()).toBeInstanceOf(ValidatorService);
	});

	it("should sync the profile", async () => {
		const syncSpy = vi.spyOn(profile.wallets(), "restore").mockResolvedValue(undefined);
		const activeNetworkSyncSpy = vi.spyOn(profile.activeNetwork(), "sync").mockResolvedValue(undefined);

		await profile.sync();

		expect(syncSpy).toHaveBeenCalled();
		expect(activeNetworkSyncSpy).toHaveBeenCalled();

		syncSpy.mockRestore();
		activeNetworkSyncSpy.mockRestore();
	});

	it("should not sync active network if there are no wallets", async () => {
		const walletCountSpy = vi.spyOn(profile.wallets(), "count").mockReturnValue(0);
		const restoreSpy = vi.spyOn(profile.wallets(), "restore").mockResolvedValue(undefined);
		const activeNetworkSyncSpy = vi.spyOn(profile.activeNetwork(), "sync").mockResolvedValue(undefined);

		await profile.sync();

		expect(restoreSpy).toHaveBeenCalled();
		expect(activeNetworkSyncSpy).not.toHaveBeenCalled();

		walletCountSpy.mockRestore();
		restoreSpy.mockRestore();
		activeNetworkSyncSpy.mockRestore();
	});

	it("should mark the introductory tutorial as complete", () => {
		const setSpy = vi.spyOn(profile.data(), "set");
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");
		profile.markIntroductoryTutorialAsComplete();
		expect(setSpy).toHaveBeenCalledWith(ProfileData.HasCompletedIntroductoryTutorial, true);
		expect(statusSpy).toHaveBeenCalled();
	});

	it("should check if the introductory tutorial has been completed", () => {
		const hasSpy = vi.spyOn(profile.data(), "has");
		profile.hasCompletedIntroductoryTutorial();
		expect(hasSpy).toHaveBeenCalledWith(ProfileData.HasCompletedIntroductoryTutorial);
	});

	it("should mark the manual installation disclaimer as accepted", () => {
		const setSpy = vi.spyOn(profile.data(), "set");
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");
		profile.markManualInstallationDisclaimerAsAccepted();
		expect(setSpy).toHaveBeenCalledWith(ProfileData.HasAcceptedManualInstallationDisclaimer, true);
		expect(statusSpy).toHaveBeenCalled();
	});

	it("should check if the manual installation disclaimer has been accepted", () => {
		const hasSpy = vi.spyOn(profile.data(), "has");
		profile.hasAcceptedManualInstallationDisclaimer();
		expect(hasSpy).toHaveBeenCalledWith(ProfileData.HasAcceptedManualInstallationDisclaimer);
	});

	it("should have a ledger service", () => {
		expect(profile.ledger()).toBeInstanceOf(LedgerService);
	});

	it("should have a known wallet service", () => {
		expect(profile.knownWallets()).toBeInstanceOf(KnownWalletService);
	});

	it("should have an exchange rate service", () => {
		expect(profile.exchangeRates()).toBeInstanceOf(ExchangeRateService);
	});

	it("should fall back to attribute avatar", () => {
		const spy = vi.spyOn(profile.settings(), "get").mockReturnValue(undefined);
		profile.getAttributes().set("avatar", "new_avatar");
		expect(profile.avatar()).toBe("new_avatar");
		spy.mockRestore();
	});

	it("should return avatar from settings", () => {
		profile.settings().set(ProfileSetting.Avatar, "settings_avatar");
		expect(profile.avatar()).toBe("settings_avatar");
	});

	it("should fall back to attribute name", () => {
		profile.settings().forget(ProfileSetting.Name);
		profile.getAttributes().set("name", "No-Name");
		expect(profile.name()).toBe("No-Name");
	});

	it("should handle missing active network gracefully", async () => {
		const spyInit = vi
			.spyOn(ProfileInitialiserModule, "ProfileInitialiser")
			.mockReturnValue({ initialise: vi.fn() } as any);

		const freshProfile = await env.profiles().create("New Profile");
		freshProfile.settings().set(ProfileSetting.DashboardConfiguration, { activeNetworkId: "non-existent" });
		vi.spyOn(freshProfile.networks() as NetworkRepository, "availableNetworks").mockReturnValue([]);
		expect(() => freshProfile.activeNetwork()).toThrow("Active network is missing");
		spyInit.mockRestore();
	});

	it("should use cached active network", () => {
		const activeNetwork = profile.activeNetwork();
		const spy = vi.spyOn(profile.networks() as NetworkRepository, "availableNetworks");
		expect(profile.activeNetwork()).toEqual(activeNetwork);
		expect(spy).not.toHaveBeenCalled();
	});

	it("should find a test network as a fallback", async () => {
		const spyInit = vi
			.spyOn(ProfileInitialiserModule, "ProfileInitialiser")
			.mockReturnValue({ initialise: vi.fn() } as any);

		const freshProfile = await env.profiles().create("New Profile Fallback Test");
		freshProfile.settings().forget(ProfileSetting.DashboardConfiguration);

		const availableNetworks = (freshProfile.networks() as NetworkRepository).availableNetworks();
		const testNetwork = availableNetworks.find((network) => network.isTest());
		const spy = vi
			.spyOn(freshProfile.networks() as NetworkRepository, "availableNetworks")
			.mockReturnValue([undefined, testNetwork] as any);

		expect(freshProfile.activeNetwork()).toEqual(testNetwork);
		spy.mockRestore();
		spyInit.mockRestore();
	});
});
