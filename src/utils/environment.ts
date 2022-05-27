import { ARK } from "@payvo/sdk-ark";
import { Environment } from "@payvo/sdk-profiles";
import { connectedTransport as ledgerTransportFactory } from "@/app/contexts/Ledger/transport";
import { httpClient } from "@/app/services";
import { StubStorage } from "@/tests/mocks";
import { isE2E, isUnit } from "@/utils/test-helpers";

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
			"0.0.9": async function ({ profile, data }) {
				if (typeof data.networks === "object" && Object.keys(data.networks).length > 0) {
					// Networks already assigned to profile, skipping migration
					return;
				}

				const initialNetworks = {};
				const networksIds = Object.keys(ARK.manifest.networks).filter(
					(networkId) => isE2E() || networkId.endsWith(".mainnet"),
				);

				for (const networkId of networksIds) {
					initialNetworks[networkId] = ARK.manifest.networks[networkId];
				}

				// Assign default networks to profile
				profile.networks().fill(initialNetworks);

				await env.persist();
			},
		},
		"1.0.0",
	);

	return env;
};
