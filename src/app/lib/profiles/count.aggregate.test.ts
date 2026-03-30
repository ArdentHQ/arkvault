import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { IProfile } from "./contracts";
import { env } from "@/utils/testing-library";
import { CountAggregate } from "./count.aggregate";

let profile: IProfile;
let countAggregate: CountAggregate;

describe("CountAggregate", () => {
	beforeEach(async () => {
		profile = await env.profiles().create("test profile");
		countAggregate = new CountAggregate(profile);
	});

	afterEach(() => {
		env.profiles().forget(profile.id());
	});

	it("should return contacts count", () => {
		expect(countAggregate.contacts()).toBe(0);
	});

	it("should return notifications count", () => {
		expect(countAggregate.notifications()).toBe(0);
	});

	it("should return wallets count", () => {
		expect(countAggregate.wallets()).toBe(0);
	});
});
