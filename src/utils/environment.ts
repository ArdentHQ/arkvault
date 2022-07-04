import { Networks } from "@ardenthq/sdk";
import { ARK } from "@ardenthq/sdk-ark";
import { Environment } from "@ardenthq/sdk-profiles";
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

				// Assign default networks to profile
				const initialNetworks = {
					"ark.mainnet": ARK.manifest.networks["ark.mainnet"],
				};

				if (isE2E()) {
					initialNetworks["ark.devnet"] = ARK.manifest.networks["ark.devnet"];
				}

				profile.networks().fill(initialNetworks);

				await env.persist();
			},
			"1.0.0": function ({ data }) {
				if (typeof data.networks === "object" && !data.networks.ark) {
					return;
				}

				for (const manifest of Object.values<Networks.NetworkManifest>(data.networks.ark)) {
					if (manifest.constants.epoch === undefined) {
						manifest.constants.epoch = ARK.manifest.networks[manifest.id].constants.epoch;
					}

					if (manifest.hosts.some((host: Networks.NetworkHost) => host.host.includes("payvo.com"))) {
						manifest.hosts = [...ARK.manifest.networks[manifest.id].hosts];
					}
				}
			},
		},
		"1.0.0",
	);

	return env;
};
