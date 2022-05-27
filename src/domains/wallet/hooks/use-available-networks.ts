import { useMemo } from "react";
import { Networks } from "@payvo/sdk";
import { Contracts } from "@payvo/sdk-profiles";
import { useEnvironmentContext } from "@/app/contexts";

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

		return availableNetworks;
	}, [env, profile, filter, isProfileRestored]);
};
