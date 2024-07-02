import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useMemo } from "react";

import { isCustomNetwork } from "@/utils/network-utils";

const sortNetworks = (networks: Networks.Network[]) =>
	networks.sort((a, b) => {
		if (isCustomNetwork(a) && !isCustomNetwork(b)) {
			return 1;
		}

		if (!isCustomNetwork(a) && isCustomNetwork(b)) {
			return -1;
		}

		return 0;
	});

export const useNetworks = ({
	filter,
	profile,
}: {
	filter?: (network: Networks.Network) => boolean;
	profile: Contracts.IProfile;
}): Networks.Network[] => {
	const isProfileRestored = profile.status().isRestored();

	return useMemo(() => {
		if (!isProfileRestored) {
			return [];
		}

		if (filter) {
			return sortNetworks(profile.availableNetworks()).filter((network) => filter(network));
		}

		return sortNetworks(profile.availableNetworks());
	}, [profile, filter, isProfileRestored]);
};
