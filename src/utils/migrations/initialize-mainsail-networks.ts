import { isE2E, isPreview } from "@/utils/test-helpers";

import { Mainsail } from "@ardenthq/sdk-mainsail";

export const initializeMainsailNetworks = ({ data }) => {
	if (typeof data.networks === "object" && !!data.networks.mainsail) {
		// Networks already assigned to profile, skipping migration
		return;
	}

	if (!data.networks) {
		data.networks = {};
	}

	data.networks.mainsail = {
		mainnet: Mainsail.manifest.networks["mainsail.mainnet"],
	};

	if (isE2E() || isPreview()) {
		data.networks.mainsail.devnet = Mainsail.manifest.networks["mainsail.devnet"];
	}
};
