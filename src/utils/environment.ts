import { Environment } from "@/app/lib/profiles";
import { StubStorage } from "@/tests/mocks";
import { httpClient } from "@/app/services";
import { initializeMainsailNetworks } from "./migrations/initialize-mainsail-networks";
import { isE2E, isUnit } from "@/utils/test-helpers";

export const initializeEnvironment = (): Environment => {
	const storage = isE2E() || isUnit() ? new StubStorage() : "indexeddb";

	const env = new Environment({
		coins: {},
		httpClient,
		storage,
	});

	env.setMigrations(
		{
			"1.2.1": initializeMainsailNetworks,
		},
		"1.2.2",
	);

	return env;
};
