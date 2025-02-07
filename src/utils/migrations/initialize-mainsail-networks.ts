import { Mainsail } from "@ardenthq/sdk-mainsail";

export const initializeMainsailNetworks = ({ data }) => {
	if (!data.networks) {
		data.networks = {};
	}

	data.networks.mainsail = {
		devnet: Mainsail.manifest.networks["mainsail.devnet"],
		mainnet: Mainsail.manifest.networks["mainsail.mainnet"]
	};

	data.networks.mainsail.devnet.meta.enabled = true;
	data.networks.mainsail.mainnet.meta.enabled = true;
};
