import { ARK } from "@ardenthq/sdk-ark";
import { Environment } from "@ardenthq/sdk-profiles";
import { Mainsail } from "@ardenthq/sdk-mainsail";
import { connectedTransport as ledgerTransportFactory } from "@/app/contexts/Ledger/transport";
import { httpClient } from "@/app/services";
import { StubStorage } from "@/tests/mocks";
import { isE2E, isUnit } from "@/utils/test-helpers";
import { initializeArkNetworks } from "@/utils/migrations/initialize-ark-networks";
import { updateArkConstants } from "@/utils/migrations/update-ark-constants";
import { updateArkNethashes } from "@/utils/migrations/update-ark-nethashes";

export const initializeEnvironment = (): Environment => {
	const storage = isE2E() || isUnit() ? new StubStorage() : "indexeddb";

	const env = new Environment({
		coins: {
			ARK,
			Mainsail,
		},
		httpClient,
		ledgerTransportFactory,
		storage,
	});

	env.setMigrations(
		{
			"0.0.9": initializeArkNetworks,
			"1.1.0": updateArkConstants,
			"1.2.0": updateArkNethashes,
		},
		"1.2.0",
	);

	return env;
};
