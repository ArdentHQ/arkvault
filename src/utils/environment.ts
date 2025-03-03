import { Environment } from "@ardenthq/sdk-profiles";
import { Mainsail } from "@ardenthq/sdk-mainsail";
import { StubStorage } from "@/tests/mocks";
import { connectedTransport as ledgerTransportFactory } from "@/app/contexts/Ledger/transport";
import { httpClient } from "@/app/services";
import { initializeMainsailNetworks } from "./migrations/initialize-mainsail-networks";
import { isE2E, isUnit } from "@/utils/test-helpers";
import { updateArkConstants } from "@/utils/migrations/update-ark-constants";
import { updateArkNethashes } from "@/utils/migrations/update-ark-nethashes";
import { removeArkNetworks } from "./migrations/remove-ark-networks";

export const initializeEnvironment = (): Environment => {
	const storage = isE2E() || isUnit() ? new StubStorage() : "indexeddb";

	const env = new Environment({
		coins: {
			Mainsail,
		},
		httpClient,
		ledgerTransportFactory,
		storage,
	});

	env.setMigrations(
		{
			"1.1.0": updateArkConstants,
			"1.2.0": updateArkNethashes,
			"1.2.1": initializeMainsailNetworks,
			"1.2.2": removeArkNetworks,
		},
		"1.2.2",
	);

	return env;
};
