import { Networks } from "@ardenthq/sdk";
import { ARK } from "@ardenthq/sdk-ark";

export const updateArkConstants = ({ data }) => {
	if (typeof data.networks === "object" && !data.networks.ark) {
		return;
	}

	for (const manifest of Object.values<Networks.NetworkManifest>(data.networks.ark)) {
		if (manifest.constants.epoch === undefined) {
			manifest.constants.epoch = ARK.manifest.networks[manifest.id].constants.epoch;
		}

		if (manifest.hosts.some((host: Networks.NetworkHost) => host.host.includes("payvo.com"))) {
			manifest.hosts = [...ARK.manifest.networks[manifest.id].hosts];
		}
	}
};
