import { describe, expect, it, beforeEach } from "vitest";
import { IProfile } from "./contracts";
import { ProfileSerialiser } from "./profile.serialiser";
import { env, getMainsailProfileId } from "@/utils/testing-library";

describe("ProfileSerialiser", () => {
	let profile: IProfile;
	let subject: ProfileSerialiser;

	beforeEach(() => {
		profile = env.profiles().findById(getMainsailProfileId());
		subject = new ProfileSerialiser(profile);
	});

	it("should serialize the profile to JSON", () => {
		const result = subject.toJSON();

		expect(result.id).toBe(profile.id());
		expect(result.contacts).toEqual(profile.contacts().toObject());
		expect(result.data).toEqual(profile.data().all());
		expect(result.exchangeTransactions).toEqual(profile.exchangeTransactions().toObject());
		expect(result.hosts).toEqual(profile.hosts().all());
		expect(result.networks).toEqual(profile.networks().all());
		expect(result.notifications).toEqual(profile.notifications().all());
		expect(result.settings).toEqual(profile.settings().all());
		expect(result.wallets).toEqual(
			profile.wallets().toObject({
				addNetworkInformation: true,
				excludeEmptyWallets: false,
				excludeLedgerWallets: false,
			}),
		);
	});

	it("should throw if saveGeneralSettings is false", () => {
		const options = {
			addNetworkInformation: true,
			excludeEmptyWallets: false,
			excludeLedgerWallets: false,
			saveGeneralSettings: false,
		};

		expect(() => subject.toJSON(options)).toThrow("This is not implemented yet");
	});
});
