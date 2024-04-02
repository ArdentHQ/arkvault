import { ARK } from "@ardenthq/sdk-mainsail";
import { Networks } from "@ardenthq/sdk";

export const updateArkNethashes = ({ data }) => {
	if (typeof data.networks === "object" && !data.networks.mainsail) {
		return;
	}

	for (const manifest of Object.values<Networks.NetworkManifest>(data.networks.mainsail)) {
		if (["mainsail.devnet", "mainsail.mainnet"].includes(manifest.id)) {
			if (!manifest.meta) {
				manifest.meta = {};
			}

			manifest.meta.nethash = ARK.manifest.networks[manifest.id].meta?.nethash;
		}
	}
};
