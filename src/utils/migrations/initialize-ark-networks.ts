import { ARK } from "@ardenthq/sdk-ark";
import { isE2E, isPreview } from "@/utils/test-helpers";

export const initializeArkNetworks = ({ data }) => {
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
