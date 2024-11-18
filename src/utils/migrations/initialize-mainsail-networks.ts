import { Mainsail } from "@ardenthq/sdk-mainsail";

export const initializeMainsailNetworks = ({ data }) => {
	console.log("mainsail network")
	if (!data.networks) {
		data.networks = {};
	}

	data.networks.mainsail = {
		devnet: Mainsail.manifest.networks["mainsail.devnet"],
	};
	console.log({ data })
};
