import { Mainsail } from "@ardenthq/sdk-mainsail";

export const initializeMainsailNetworks = ({ data }) => {
	// if (isE2E()) {
	// 	return;
	// }

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
