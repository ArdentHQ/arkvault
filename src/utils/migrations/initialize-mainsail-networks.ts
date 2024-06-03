import { Mainsail } from "@ardenthq/sdk-mainsail";
import { isE2E } from "@/utils/test-helpers";

export const initializeMainsailNetworks = ({ data }) => {
	if (isE2E()) {
		return;
	}

	if (!data.networks) {
		data.networks = {};
	}

	data.networks.mainsail = {
		devnet: Mainsail.manifest.networks["mainsail.devnet"],
	};

	console.log("initializeMainsailNetworks");
};
