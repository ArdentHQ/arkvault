import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
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

		return profile.wallets().findById(walletId);
	}, [profile, parameters]);
};

export const useNetworkFromQueryParameters = (profile: Contracts.IProfile): Networks.Network => {
	const parameters = useQueryParameters();
	const { t } = useTranslation();

	const network = useMemo(
		() => profile.availableNetworks().find((network) => network.meta().nethash === parameters.get("nethash")),
		[profile, parameters],
	);

	if (!network) {
		throw new Error(t("TRANSACTION.VALIDATION.NETHASH_MISSING"));
	}

	return network;
};
