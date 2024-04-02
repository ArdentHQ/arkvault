import { isE2E, isPreview } from "@/utils/test-helpers";

import { ARK } from "@ardenthq/sdk-mainsail";

export const initializeMainsailNetworks = ({ data }) => {
	if (typeof data.networks === "object" && !!data.networks.mainsail) {
		// Networks already assigned to profile, skipping migration
		return;
	}

	if (!data.networks) {
		data.networks = {};
	}

	data.networks.mainsail = {
		mainnet: ARK.manifest.networks["mainsail.mainnet"],
	};

	if (isE2E() || isPreview()) {
		data.networks.mainsail.devnet = ARK.manifest.networks["mainsail.devnet"];
	}
};
