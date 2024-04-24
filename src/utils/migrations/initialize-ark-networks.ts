import { Mainsail } from "@ardenthq/sdk-mainsail";

export const initializeArkNetworks = ({ data }) => {
	if (typeof data.networks === "object" && !!data.networks.mainsail) {
		// Networks already assigned to profile, skipping migration
		return;
	}

	if (!data.networks) {
		data.networks = {};
	}

	// @TODO: once mainnet is available, add the devnet network only for E2E and preview
	// `if (isE2E() || isPreview())`
	data.networks.mainsail = {
		devnet: Mainsail.manifest.networks["mainsail.devnet"],
	};
};
