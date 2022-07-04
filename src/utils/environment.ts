import { ARK } from "@ardenthq/sdk-ark";
import { Environment } from "@ardenthq/sdk-profiles";
import { connectedTransport as ledgerTransportFactory } from "@/app/contexts/Ledger/transport";
import { httpClient } from "@/app/services";
import { StubStorage } from "@/tests/mocks";
import { isE2E, isUnit } from "@/utils/test-helpers";
import { initializeArkNetworks } from "@/utils/migrations/initialize-ark-networks";
import { updateArkConstants } from "@/utils/migrations/update-ark-constants";

export const initializeEnvironment = (): Environment => {
	/* istanbul ignore next */
	const storage = isE2E() || isUnit() ? new StubStorage() : "indexeddb";

	const env = new Environment({
		coins: {
			ARK,
		},
		httpClient,
		ledgerTransportFactory,
		storage,
	});

	env.setMigrations(
		{
			"0.0.9": initializeArkNetworks(env),
			"1.0.0": updateArkConstants(),
		},
		"1.0.0",
	);

	return env;
};
