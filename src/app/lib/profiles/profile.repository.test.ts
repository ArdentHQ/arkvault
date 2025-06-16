import { describe, expect, it, beforeEach, vi } from "vitest";
import { IProfileRepository, IProfileExportOptions, IProfileInput } from "./contracts";
import { env, getDefaultPassword } from "@/utils/testing-library";
import { Profile } from "./profile";
import { ProfileExporter } from "./profile.exporter";

describe("ProfileRepository", () => {
	let subject: IProfileRepository;

	beforeEach(() => {
		subject = env.profiles();
		subject.flush();
	});

	it("should fill the repository", () => {
		expect(subject.count()).toBe(0);

		const profile = new Profile({ data: "", id: "uuid", name: "name" }, env);
		subject.fill({ [profile.id()]: profile.getAttributes().all() });

		expect(subject.count()).toBe(1);
		expect(subject.findById("uuid")).toBeInstanceOf(Profile);
	});

	it("should create a profile", async () => {
		const profile = await subject.create("John Doe");
		expect(subject.count()).toBe(1);
		expect(profile.name()).toBe("John Doe");

		await expect(subject.create("John Doe")).rejects.toThrow("The profile [John Doe] already exists.");
	});

	it("should find a profile by name", async () => {
		await subject.create("John Doe");
		const found = subject.findByName("John Doe");
		expect(found).toBeInstanceOf(Profile);
		expect(subject.findByName("invalid")).toBeUndefined();
	});

	it("should push a profile", async () => {
		const profile = await subject.create("John Doe");
		subject.push(profile);
		expect(subject.count()).toBe(1);
	});

	it("should import a profile", async () => {
		const profile = await subject.create("John Doe");
		const exported = await new ProfileExporter(profile).export();
		const imported = await subject.import(exported);
		expect(imported.name()).toBe("John Doe");
	});

	it("should restore a profile", async () => {
		const profile = await subject.create("John Doe");
		profile.status().markAsClean(); // To avoid persistence
		const spy = vi.spyOn(profile.status(), "markAsRestored");
		await subject.restore(profile);
		expect(spy).toHaveBeenCalled();
	});

	it("should dump a profile", async () => {
		const profile = await subject.create("John Doe");
		const dumped = subject.dump(profile);
		expect(dumped.id).toBe(profile.id());
		expect(dumped.name).toBe("John Doe");
	});

	it("should export a profile", async () => {
		const profile = await subject.create("John Doe");
		const options: IProfileExportOptions = {
			addNetworkInformation: true,
			excludeEmptyWallets: false,
			excludeLedgerWallets: false,
			saveGeneralSettings: true,
		};
		const exported = await subject.export(profile, options, getDefaultPassword());
		expect(typeof exported).toBe("string");
	});

	describe("persist", () => {
		it("should do nothing if not restored", async () => {
			const profile = new Profile({ data: "", id: "uuid", name: "name" }, env);
			const spy = vi.spyOn(profile.status(), "isDirty");
			await subject.persist(profile);
			expect(spy).not.toHaveBeenCalled();
		});

		it("should do nothing if not dirty", async () => {
			const profile = await subject.create("John Doe");
			profile.status().markAsClean();
			const exporterSpy = vi.spyOn(ProfileExporter.prototype, "export");
			await subject.persist(profile);
			expect(exporterSpy).not.toHaveBeenCalled();
		});

		it("should persist with password", async () => {
			const profile = await subject.create("John Doe");
			await profile.auth().setPassword(getDefaultPassword());
			profile.password().set(getDefaultPassword());
			const exporterSpy = vi.spyOn(ProfileExporter.prototype, "export");
			await subject.persist(profile);
			expect(exporterSpy).toHaveBeenCalledWith(getDefaultPassword());
		});

		it("should persist without password", async () => {
			const profile = await subject.create("John Doe");
			profile.getAttributes().forget("password");
			profile.status().markAsDirty();
			const exporterSpy = vi.spyOn(ProfileExporter.prototype, "export");
			await subject.persist(profile);
			expect(exporterSpy).toHaveBeenCalledWith();
		});
	});

	it("should get all profiles", async () => {
		await subject.create("John Doe");
		await subject.create("Jane Doe");

		expect(Object.keys(subject.all())).toHaveLength(2);
	});

	it("should get the first and last profiles", async () => {
		const john = await subject.create("John Doe");
		const jane = await subject.create("Jane Doe");

		expect(subject.first()).toEqual(john);
		expect(subject.last()).toEqual(jane);
	});

	it("should get all keys and values", async () => {
		const john = await subject.create("John Doe");
		const jane = await subject.create("Jane Doe");

		expect(subject.keys()).toEqual([john.id(), jane.id()]);
		expect(subject.values()).toEqual([john, jane]);
	});

	it("should find a profile by its ID", async () => {
		const john = await subject.create("John Doe");

		const foundProfile = subject.findById(john.id());
		expect(foundProfile).toEqual(john);
		expect(() => subject.findById("invalid-id")).toThrow("No profile found for [invalid-id].");
	});

	it("should check if a profile exists", async () => {
		const john = await subject.create("John Doe");

		expect(subject.has(john.id())).toBe(true);
		expect(subject.has("invalid-id")).toBe(false);
	});

	it("should forget a profile", async () => {
		const john = await subject.create("John Doe");
		expect(subject.count()).toBe(1);

		subject.forget(john.id());
		expect(subject.count()).toBe(0);
		expect(() => subject.forget("invalid-id")).toThrow("No profile found for [invalid-id].");
	});

	it("should flush the repository", async () => {
		await subject.create("John Doe");
		expect(subject.count()).toBe(1);

		subject.flush();
		expect(subject.count()).toBe(0);
	});

	it("should get the profile count", async () => {
		expect(subject.count()).toBe(0);
		await subject.create("John Doe");
		expect(subject.count()).toBe(1);
	});

	it("should convert to object", async () => {
		const profile = await subject.create("John Doe");
		const obj = subject.toObject();
		expect((obj[profile.id()] as IProfileInput).id).toBe(profile.id());
	});
});
