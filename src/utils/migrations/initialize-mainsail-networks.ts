import { Mainsail } from "@ardenthq/sdk-mainsail";
import { isE2E } from "@/utils/test-helpers";

export const initializeMainsailNetworks = ({ data }) => {
	// @TODO: add mainsail network once network mocks, fixtures & wallet will be implemented for tests.
	// @see https://app.clickup.com/t/86dtaccqj
	if (isE2E()) {
		return;
	}

	if (typeof data.networks === "object" && !!data.networks.mainsail) {
		// Networks already assigned to profile, skipping migration
		return;
	}

	if (!data.networks) {
		data.networks = {};
	}

	data.networks.mainsail = {
		devnet: Mainsail.manifest.networks["mainsail.devnet"],
	};
};
