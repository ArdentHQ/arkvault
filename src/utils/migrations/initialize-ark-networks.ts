import { ARK } from "@ardenthq/sdk-ark";
import { isE2E } from "@/utils/test-helpers";

export const initializeArkNetworks = ({ data }) => {
	if (typeof data.networks === "object" && !!data.networks.ark) {
		// Networks already assigned to profile, skipping migration
		return;
	}

	// Assign default networks to profile
	data.networks.ark.mainnet = ARK.manifest.networks["ark.mainnet"];

	if (isE2E()) {
		data.networks.ark.devnet = ARK.manifest.networks["ark.devnet"];
	}
};
