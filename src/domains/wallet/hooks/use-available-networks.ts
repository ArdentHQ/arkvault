import { useMemo } from "react";
import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useEnvironmentContext } from "@/app/contexts";
import { isCustomNetwork } from "@/utils/network-utils";

export const useAvailableNetworks = ({
	filter,
	profile,
}: {
	filter?: (network: Networks.Network) => boolean;
	profile: Contracts.IProfile;
}): Networks.Network[] => {
	const { env } = useEnvironmentContext();

	const isProfileRestored = profile.status().isRestored();

	return useMemo(() => {
		if (!isProfileRestored) {
			return [];
		}

		let availableNetworks = profile.availableNetworks();

		if (filter) {
			availableNetworks = availableNetworks.filter((network) => filter(network));
		}

		return availableNetworks.sort((a, b) => {
			if (isCustomNetwork(a) && !isCustomNetwork(b)) {
				return 1;
			}

			if (!isCustomNetwork(a) && isCustomNetwork(b)) {
				return -1;
			}

			return 0;
		});
	}, [env, profile, filter, isProfileRestored]);
};
