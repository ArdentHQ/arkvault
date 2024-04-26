import { ARK } from "@ardenthq/sdk-ark";
import { Environment } from "@ardenthq/sdk-profiles";
import { Mainsail } from "@ardenthq/sdk-mainsail";
import { initializeMainsailNetworks } from "./migrations/initialize-mainsail-networks";
import { isE2E, isUnit } from "@/utils/test-helpers";
import { StubStorage } from "@/tests/mocks";
import { httpClient } from "@/app/services";
import { connectedTransport as ledgerTransportFactory } from "@/app/contexts/Ledger/transport";
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
			// @TODO: initialize mainsail networks once mainsail is setup in tests.
			"0.0.9": isE2E() ? () => undefined : initializeMainsailNetworks,
			"1.1.0": updateArkConstants,
			"1.2.0": updateArkNethashes,
		},
		"1.2.0",
	);

	return env;
};
