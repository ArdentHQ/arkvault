import { useCallback } from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { Networks } from "@ardenthq/sdk";
import { networksAsOptions } from "@/utils/network-utils";
import { useNetworks } from "./use-networks";

export const useNetworkOptions = ({ profile }: { profile: Contracts.IProfile }) => {
	const networks = useNetworks({ profile });

	const networkOptions = useCallback(
		(customNetworks?: Networks.Network[]) => networksAsOptions(customNetworks || networks),
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
