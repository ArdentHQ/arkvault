import { ARK } from "@ardenthq/sdk-mainsail";
import { isE2E, isPreview } from "@/utils/test-helpers";

export const initializeArkNetworks = ({ data }) => {
	if (typeof data.networks === "object" && !!data.networks.ark) {
		// Networks already assigned to profile, skipping migration
		return;
	}

	if (!data.networks) {
		data.networks = {};
	}

	data.networks.ark = {
		mainnet: ARK.manifest.networks["mainsail.mainnet"],
	};

	if (isE2E() || isPreview()) {
		data.networks.mainsail.devnet = ARK.manifest.networks["mainsail.devnet"];
	}
};
