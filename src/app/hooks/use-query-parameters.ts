import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export const useQueryParameters = () => {
	const { search } = useLocation();

	return useMemo(() => new URLSearchParams(search), [search]);
};

export const useWalletFromQueryParameters = (profile: Contracts.IProfile): Contracts.IReadWriteWallet | undefined => {
	const parameters = useQueryParameters();
	const walletId = parameters.get("walletId");

	return useMemo(() => {
		if (!walletId) {
			return;
		}

		try {
			return profile.wallets().findById(walletId);
		} catch {
			//
		}
	}, [profile, parameters]);
};

export const useNetworkFromQueryParameters = (profile: Contracts.IProfile): Networks.Network | undefined => {
	const parameters = useQueryParameters();

	return useMemo(
		() => profile.availableNetworks().find((network) => network.meta().nethash === parameters.get("nethash")),
		[profile, parameters],
	);
};
