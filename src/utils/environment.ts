import { Environment } from "@/app/lib/profiles";
import { Mainsail } from "@/app/lib/mainsail";
import { StubStorage } from "@/tests/mocks";
import { connectedTransport as ledgerTransportFactory } from "@/app/contexts/Ledger/transport";
import { httpClient } from "@/app/services";
import { initializeMainsailNetworks } from "./migrations/initialize-mainsail-networks";
import { isE2E, isUnit } from "@/utils/test-helpers";

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
			"1.2.1": initializeMainsailNetworks,
		},
		"1.2.2",
	);

	return env;
};
