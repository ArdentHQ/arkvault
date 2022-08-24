import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { isAllowedNetwork } from "@/app/hooks/use-search-parameters-validation";

export const useQueryParameters = () => {
	const { search } = useLocation();

	return useMemo(() => new URLSearchParams(search), [search]);
};

export const useNetworkFromQueryParameters = (profile: Contracts.IProfile): Networks.Network | undefined => {
	const parameters = useQueryParameters();

	return useMemo(() => {
		const networkId = parameters.get("network");

		if (networkId && isAllowedNetwork(networkId)) {
			return profile.availableNetworks().find((network) => network.id() === networkId);
		}

		return profile.availableNetworks().find((network) => network.meta().nethash === parameters.get("nethash"));
	}, [profile, parameters]);
};
