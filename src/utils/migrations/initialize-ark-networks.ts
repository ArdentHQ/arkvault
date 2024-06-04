import { ARK } from "@ardenthq/sdk-ark";

export const initializeArkNetworks = ({ data }) => {
	if (!data.networks) {
		data.networks = {};
	}

	data.networks.ark = {
		devnet: ARK.manifest.networks["ark.devnet"],
		mainnet: ARK.manifest.networks["ark.mainnet"],
	};
};
