import { useCallback } from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { Networks } from "@ardenthq/sdk";
import { useAvailableNetworks } from "@/domains/wallet/hooks";
import { isCustomNetwork } from "@/utils/network-utils";

export const useNetworkOptions = ({ profile }: { profile: Contracts.IProfile }) => {
	const networks = useAvailableNetworks({ profile });

	const networkOptions = useCallback(
		(customNetworks?: Networks.Network[]) => {
			const filteredNetworks = customNetworks || networks;

			return filteredNetworks.map((network) => {
				let label = network.coinName();

				if (network.isTest() && !isCustomNetwork(network)) {
					label = `${label} ${network.name()}`;
				}

				return {
					isTestNetwork: network.isTest(),
					label,
					value: network.id(),
				};
			});
		},
		[networks],
	);

	const networkById = useCallback(
		(id?: string) => profile.availableNetworks().find((network) => network.id() === id),
		[profile],
	);

	return {
		networkById,
		networkOptions,
		networks,
	};
};
