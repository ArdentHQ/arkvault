import { describe, expect, it, vi } from "vitest";
import { ProfileImporter } from "./profile.importer";
import { env, getMainsailProfileId, getDefaultPassword } from "@/utils/testing-library";
import { Migrator } from "./migrator";
import { Base64, PBKDF2 } from "@ardenthq/arkvault-crypto";
import { ProfileExporter } from "./profile.exporter";
import { ProfileSerialiser } from "./profile.serialiser";

const migrator = vi.spyOn(Migrator.prototype, "migrate");

describe("ProfileImporter", () => {
	it("should import a plain profile", async () => {
		const profile = env.profiles().findById(getMainsailProfileId());
		const plainExport = await new ProfileExporter(profile).export();
		profile.getAttributes().set("data", plainExport);
		const importer = new ProfileImporter(profile, env);
		await importer.import();
		expect(profile.name()).toBe("Foo Bar");
	});

	it("should import an encrypted profile", async () => {
		const profile = env.profiles().findById(getMainsailProfileId());
		const password = getDefaultPassword();
		const serialised = new ProfileSerialiser(profile).toJSON();
		const encrypted = await PBKDF2.encrypt(JSON.stringify({ data: serialised }), password);
		const base64 = Base64.encode(encrypted);
		profile.getAttributes().set("data", base64);
		profile.getAttributes().set("password", password);
		profile.password().set(password);

		const importer = new ProfileImporter(profile, env);
		await importer.import(password);

		expect(profile.name()).toBe("Foo Bar");
	});

	it("should throw if the wrong password is provided", async () => {
		const profile = env.profiles().findById(getMainsailProfileId());
		const password = getDefaultPassword();
		const serialised = new ProfileSerialiser(profile).toJSON();
		const encrypted = await PBKDF2.encrypt(JSON.stringify({ data: serialised }), password);
		const base64 = Base64.encode(encrypted);
		profile.getAttributes().set("data", base64);
		profile.getAttributes().set("password", password);
		profile.password().set(password);

		const importer = new ProfileImporter(profile, env);

		await expect(importer.import("wrong-password")).rejects.toThrow();
	});

	it("should run the migrator if the env has schemas and a version", async () => {
		const profile = env.profiles().findById(getMainsailProfileId());
		const customEnv = {
			...env,
			migrationSchemas: () => ({ "2.0.0": () => {} }),
			migrationVersion: () => "2.0.0",
		};
		const serialised = new ProfileSerialiser(profile).toJSON();
		const plainExport = Base64.encode(JSON.stringify(serialised));
		profile.getAttributes().set("data", plainExport);
		const importer = new ProfileImporter(profile, customEnv as any);

		await importer.import();

		expect(migrator).toHaveBeenCalledWith({ "2.0.0": expect.any(Function) }, "2.0.0");
	});

	it("should throw an error if the data is malformed", async () => {
		const profile = env.profiles().findById(getMainsailProfileId());
		profile.getAttributes().set("data", "{}");
		const importer = new ProfileImporter(profile, env);
		await expect(importer.import()).rejects.toThrow();
	});

	it("should throw an error if the data is undefined and no password is provided", async () => {
		const profile = env.profiles().findById(getMainsailProfileId());
		profile.getAttributes().set("data", Base64.encode(JSON.stringify({})));
		const importer = new ProfileImporter(profile, env);
		await expect(importer.import()).rejects.toThrow("PasswordRequired");
	});
});
