import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { IProfile } from "./contracts";
import { env, getDefaultProfileId } from "@/utils/testing-library";
import { RegistrationAggregate } from "./registration.aggregate";

let profile: IProfile;
let registrationAggregate: RegistrationAggregate;

describe("RegistrationAggregate", () => {
	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		registrationAggregate = new RegistrationAggregate(profile);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should return empty array when no wallets exist", () => {
		vi.spyOn(profile.wallets(), "values").mockReturnValue([]);
		expect(registrationAggregate.validators()).toEqual([]);
	});

	it("should return only validators that have synced with network", () => {
		const wallet1 = profile.wallets().first();
		const wallet2 = profile.wallets().last();

		vi.spyOn(wallet1, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet1, "isValidator").mockReturnValue(true);
		vi.spyOn(wallet2, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet2, "isValidator").mockReturnValue(false);

		vi.spyOn(profile.wallets(), "values").mockReturnValue([wallet1, wallet2] as any);

		const validators = registrationAggregate.validators();

		expect(validators).toHaveLength(1);
		expect(validators[0]).toBe(wallet1);
	});

	it("should return multiple validators when multiple wallets are validators", () => {
		const wallet1 = profile.wallets().first();
		const wallet2 = profile.wallets().last();

		vi.spyOn(wallet1, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet1, "isValidator").mockReturnValue(true);
		vi.spyOn(wallet2, "hasSyncedWithNetwork").mockReturnValue(true);
		vi.spyOn(wallet2, "isValidator").mockReturnValue(true);

		vi.spyOn(profile.wallets(), "values").mockReturnValue([wallet1, wallet2] as any);

		const validators = registrationAggregate.validators();

		expect(validators).toHaveLength(2);
		expect(validators).toContain(wallet1);
		expect(validators).toContain(wallet2);
	});
});
