import { Mainsail } from "@ardenthq/sdk-mainsail";

export const initializeMainsailNetworks = ({ data }) => {
	if (!data.networks) {
		data.networks = {};
	}

	data.networks.mainsail = {
		devnet: Mainsail.manifest.networks["mainsail.devnet"],
	};

	data.networks.mainsail.devnet.meta.enabled = true;
};
