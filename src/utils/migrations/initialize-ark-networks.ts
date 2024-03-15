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
		mainnet: ARK.manifest.networks["ark.mainnet"],
	};

	if (isE2E() || isPreview()) {
		data.networks.ark.devnet = ARK.manifest.networks["ark.devnet"];
	}
};
