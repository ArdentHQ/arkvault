import { describe, beforeEach, it, expect, vi } from "vitest";
import { IProfile, IProfileExporter, IProfileExportOptions } from "./contracts";
import { ProfileExporter } from "./profile.exporter";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { Base64 } from "@ardenthq/arkvault-crypto";
import { ProfileEncrypter } from "./profile.encrypter";
import { ProfileSerialiser } from "./profile.serialiser";

describe("ProfileExporter", () => {
	let profile: IProfile;
	let subject: IProfileExporter;
	const password = "my-password";

	beforeEach(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		await profile.auth().setPassword(password);
		subject = new ProfileExporter(profile);
	});

	it("should export a profile without a password", async () => {
		profile.getAttributes().forget("password");

		const result = await subject.export();
		const decoded = JSON.parse(Base64.decode(result));

		expect(decoded).toHaveProperty("contacts");
		expect(decoded).toHaveProperty("data");
		expect(decoded).toHaveProperty("exchangeTransactions");
		expect(decoded).toHaveProperty("hosts");
		expect(decoded).toHaveProperty("networks");
		expect(decoded).toHaveProperty("notifications");
		expect(decoded).toHaveProperty("settings");
		expect(decoded).toHaveProperty("wallets");
	});

	it("should export a profile with a password", async () => {
		const encryptSpy = vi.spyOn(ProfileEncrypter.prototype, "encrypt").mockResolvedValue("encrypted-data");

		const result = await subject.export(password);

		const serialiser = new ProfileSerialiser(profile);
		const options: IProfileExportOptions = {
			addNetworkInformation: true,
			excludeEmptyWallets: false,
			excludeLedgerWallets: false,
			saveGeneralSettings: true,
		};
		const data = serialiser.toJSON(options);
		const expectedPayload = JSON.stringify({
			avatar: profile.avatar(),
			data,
			id: profile.id(),
			name: profile.name(),
			password: profile.getAttributes().get<string>("password"),
		});

		expect(encryptSpy).toHaveBeenCalledWith(expectedPayload, password);
		expect(result).toBe(Base64.encode("encrypted-data"));

		encryptSpy.mockRestore();
	});
});
