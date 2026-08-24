import { Environment } from "@/app/lib/profiles";
import { StubStorage } from "@/tests/mocks";
import { httpClient } from "@/app/services";
import { isE2E, isUnit } from "@/utils/test-helpers";
import { profileMigrations } from "@/utils/profile-migrations";

export const initializeEnvironment = (): Environment => {
	const environment = new Environment({
		httpClient,
		storage: isE2E() || isUnit() ? new StubStorage() : "indexeddb",
	});

	environment.setMigrations(profileMigrations, process.env.APP_VERSION as string);

	return environment;
};
