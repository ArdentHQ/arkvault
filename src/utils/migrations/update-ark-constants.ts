import { Networks } from "@ardenthq/sdk";
import { ARK } from "@ardenthq/sdk-ark";

export const updateArkConstants = ({ data }) => {
	for (const manifest of Object.values<Networks.NetworkManifest>(data.networks.ark)) {
		manifest.constants.epoch = ARK.manifest.networks[manifest.id].constants.epoch;
	}
};
