import { ARK } from "@ardenthq/sdk-ark";
import { Networks } from "@ardenthq/sdk";

export const updateArkNethashes = ({ data }) => {
	for (const manifest of Object.values<Networks.NetworkManifest>(data.networks.ark)) {
		if (["ark.devnet", "ark.mainnet"].includes(manifest.id)) {
			if (!manifest.meta) {
				manifest.meta = {};
			}

			manifest.meta.nethash = ARK.manifest.networks[manifest.id].meta?.nethash;
		}
	}
};
