import { Mainsail } from "@ardenthq/sdk-mainsail";
import { isE2E } from "@/utils/test-helpers";

export const initializeMainsailNetworks = ({ data }) => {
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
