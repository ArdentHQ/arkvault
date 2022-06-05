import { useCallback } from "react";
import { Contracts } from "@payvo/sdk-profiles";
import { Networks } from "@payvo/sdk";
import { useAvailableNetworks } from "@/domains/wallet/hooks";
import { networksAsOptions } from "@/utils/network-utils";

export const useNetworkOptions = ({ profile }: { profile: Contracts.IProfile }) => {
	const networks = useAvailableNetworks({ profile });

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
