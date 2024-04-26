import { Mainsail } from "@ardenthq/sdk-mainsail";
import { isE2E, isPreview } from "../test-helpers";

export const initializeMainsailNetworks = ({ data }) => {
	if (typeof data.networks === "object" && !!data.networks.mainsail) {
		// Networks already assigned to profile, skipping migration
		return;
	}

	if (!data.networks) {
		data.networks = {};
	}

	// @TODO: add mainsail network once network mocks, fixtures & wallet will be implemented for tests.
	// @see https://app.clickup.com/t/86dtaccqj
	if (isE2E()) {
		return;
	}

	data.networks.mainsail = {
		devnet: Mainsail.manifest.networks["mainsail.devnet"],
	};
};
