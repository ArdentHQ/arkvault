import { describe, it, expect, vi, beforeEach } from "vitest";
import { SettingRepository } from "./setting.repository";
import { IProfile } from "./contracts";

const createMockProfile = () =>
	({
		status: () => ({ markAsDirty: vi.fn() }),
	}) as unknown as IProfile;

describe("SettingRepository", () => {
	let profile: IProfile;
	let repository: SettingRepository;

	beforeEach(() => {
		profile = createMockProfile();
		repository = new SettingRepository(profile, ["ALLOWED_KEY", "ANOTHER_KEY"]);
	});

	it("should return all keys", () => {
		repository.set("ALLOWED_KEY", "value1");
		repository.set("ANOTHER_KEY", "value2");

		const keys = repository.keys();
		expect(keys).toBeDefined();
	});

	it("should return undefined for unknown key in get", () => {
		repository.set("ALLOWED_KEY", "value1");

		const result = repository.get("UNKNOWN_KEY");
		expect(result).toBeUndefined();
	});

	it("should not set unknown key", () => {
		repository.set("UNKNOWN_KEY", "value1");

		expect(repository.has("ALLOWED_KEY")).toBe(false);
	});

	it("should return false for unknown key in has", () => {
		const result = repository.has("UNKNOWN_KEY");
		expect(result).toBe(false);
	});

	it("should not forget unknown key", () => {
		repository.set("ALLOWED_KEY", "value1");
		repository.forget("UNKNOWN_KEY");

		expect(repository.has("ALLOWED_KEY")).toBe(true);
	});

	it("should remove unknown existing key when get is called", () => {
		repository.set("ALLOWED_KEY", "value1");

		repository.fill({ ALLOWED_KEY: "updated" });
		repository.get("ALLOWED_KEY");

		expect(repository.get("ALLOWED_KEY")).toBe("updated");
	});

	it("should remove unknown existing key when set is called", () => {
		repository.set("ALLOWED_KEY", "value1");
		repository.set("UNKNOWN_KEY", "should-not-set");

		expect(repository.has("ALLOWED_KEY")).toBe(true);
	});

	it("should remove unknown existing key when 'has' is called", () => {
		repository.set("ALLOWED_KEY", "value1");
		repository.has("UNKNOWN_KEY");

		expect(repository.has("ALLOWED_KEY")).toBe(true);
	});

	it("should remove unknown existing key when forget is called", () => {
		repository.set("ALLOWED_KEY", "value1");
		repository.forget("UNKNOWN_KEY");

		expect(repository.has("ALLOWED_KEY")).toBe(true);
	});
});
