import { Contracts, Environment } from "@ardenthq/sdk-profiles";
import { useCallback, useState } from "react";

import { NormalizedNetwork } from "@/domains/setting/pages/Servers/Servers.contracts";
import { isSameNetwork } from "@/utils/peers";
import { customNetworks, sortByName } from "@/utils/server-utils";

export const useCustomNetworks = (env: Environment, profile: Contracts.IProfile) => {
	const [allCustomNetworks, setAllCustomNetworks] = useState<NormalizedNetwork[]>(
		sortByName(customNetworks(env, profile)),
	);

	const updateNetwork = useCallback(
		(network: NormalizedNetwork) => {
			const updatedNetworks = allCustomNetworks.map((networkItem) =>
				isSameNetwork(network, networkItem) ? network : networkItem,
			);

			setAllCustomNetworks(sortByName(updatedNetworks));
			return updatedNetworks;
		},
		[profile, allCustomNetworks, isSameNetwork, setAllCustomNetworks],
	);

	const removeNetwork = useCallback(
		(network: NormalizedNetwork) => {
			const updatedNetworks = allCustomNetworks.filter((networkItem) => !isSameNetwork(network, networkItem));

			setAllCustomNetworks(sortByName(updatedNetworks));
			return updatedNetworks;
		},
		[profile, allCustomNetworks, isSameNetwork, setAllCustomNetworks],
	);

	const addNetwork = useCallback(
		(network: NormalizedNetwork) => {
			const updatedNetworks = [...allCustomNetworks, network];

			setAllCustomNetworks(sortByName(updatedNetworks));
			return updatedNetworks;
		},
		[profile, allCustomNetworks, isSameNetwork, setAllCustomNetworks],
	);

	return {
		addNetwork,
		allCustomNetworks,
		removeNetwork,
		updateNetwork,
	};
};
