import { describe, expect, it } from "vitest";

import { Profile } from "./profile";
import { ProfileFactory } from "./profile.factory";
import { env } from "@/utils/testing-library";

describe("ProfileFactory", () => {
	it("should create a profile from a name", () => {
		const profile = ProfileFactory.fromName("John Doe", env);

		expect(profile).toBeInstanceOf(Profile);
		expect(typeof profile.id()).toBe("string");
		expect(profile.name()).toBe("John Doe");
		expect(profile.usesPassword()).toBe(false);
		expect(profile.status().isDirty()).toBe(false);
		expect(profile.status().isRestored()).toBe(false);
	});
});
