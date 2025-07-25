import { Environment, StorageData } from "@/app/lib/profiles";
import { Base64 } from "@ardenthq/arkvault-crypto";

import fixtureData from "@/tests/fixtures/env/storage.json";
import TestingPasswords from "@/tests/fixtures/env/testing-passwords.json";
import { manifest } from "@/app/lib/mainsail";

export const bootEnvironmentWithProfileFixtures = async ({
	env,
	shouldRestoreDefaultProfile = false,
}: {
	env: Environment;
	shouldRestoreDefaultProfile?: boolean;
}) => {
	const ids = Object.keys(fixtureData.profiles);
	const fixtureProfiles: any = fixtureData.profiles;
	const storageData: StorageData = { data: fixtureData.data, profiles: {} };

	for (const id of ids) {
		//@ts-ignore
		const password: string = TestingPasswords?.profiles[id]?.password;

		const profileData = { id, ...fixtureProfiles[id] };
		profileData.networks = manifest.networks;
		let data = Base64.encode(JSON.stringify(profileData));

		if (password) {
			// Re-import profile as passwordless, reset password and dump encrypted data.
			delete profileData.settings.password;

			const passwordProtectedProfile = await env.profiles().import(data);
			await env.profiles().restore(passwordProtectedProfile);
			passwordProtectedProfile.auth().setPassword(password);

			data = await env.profiles().export(passwordProtectedProfile, undefined, password);
		}

		storageData.profiles[id] = {
			data,
			id,
			name: fixtureProfiles[id].settings.NAME,
			password: fixtureProfiles[id].settings.PASSWORD,
		};
	}

	await env.verify(storageData);
	await env.boot();

	// await env.profiles().restore(env.profiles().last(), "password");

	if (shouldRestoreDefaultProfile) {
		const profile = env.profiles().values()[0];
		await env.profiles().restore(profile);

		await profile.sync();
	}
};

export const isE2E = () => !!["true", "1"].includes(process.env.REACT_APP_IS_E2E?.toLowerCase() || "");

export const isUnit = () => !!["true", "1"].includes(process.env.REACT_APP_IS_UNIT?.toLowerCase() || "");

export const isPreview = () =>
	process.env.NODE_ENV === "development" ||
	["development", "preview"].includes(String(import.meta.env.VITE_VERCEL_ENV));
