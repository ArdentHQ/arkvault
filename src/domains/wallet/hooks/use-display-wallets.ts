import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useMemo } from "react";
import hash from "string-hash";
import { useAvailableNetworks } from "@/domains/wallet/hooks/use-available-networks";
import { useActiveProfile } from "@/app/hooks";
import { useWalletFilters } from "@/domains/dashboard/components/FilterWallets";
import { UseDisplayWallets } from "@/domains/wallet/hooks/use-display-wallets.contracts";
import { sortWallets } from "@/utils/wallet-utils";

const groupWalletsByNetwork = (
	wallets: Contracts.IReadWriteWallet[],
): Map<Networks.Network, Contracts.IReadWriteWallet[]> => {
	const walletsByNetwork = new Map<Networks.Network, Contracts.IReadWriteWallet[]>();

	for (const wallet of wallets) {
		walletsByNetwork.set(wallet.network(), [...(walletsByNetwork.get(wallet.network()) ?? []), wallet]);
	}

	return walletsByNetwork;
};

export const useDisplayWallets: UseDisplayWallets = () => {
	const profile = useActiveProfile();

	const isRestored = profile.status().isRestored();

	const walletsCount = profile.wallets().count();

	const starredWalletsCount = profile
		.wallets()
		.values()
		.filter((wallet) => wallet.isStarred()).length;

	const aliasesHash = hash(
		profile
			.wallets()
			.values()
			.map((wallet) => wallet.alias())
			.join(","),
	).toString();

	const { walletsDisplayType, selectedNetworkIds } = useWalletFilters({ profile });

	const profileAvailableNetworks = useAvailableNetworks({ profile });

	const wallets = useMemo(
		() =>
			sortWallets(
				profile
					.wallets()
					.valuesWithCoin()
					.filter((wallet) =>
						profileAvailableNetworks.some((network) => wallet.network().id() === network.id()),
					),
			),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[profile, isRestored, starredWalletsCount, walletsCount, aliasesHash, profileAvailableNetworks],
	);

	const filteredByDisplayType = useMemo(
		() =>
			wallets.filter(
				(wallet) =>
					(walletsDisplayType === "starred" && wallet.isStarred()) ||
					(walletsDisplayType === "ledger" && wallet.isLedger()) ||
					walletsDisplayType === "all",
			),
		[walletsDisplayType, wallets],
	);

	const groupedByNetwork = useMemo(() => groupWalletsByNetwork(wallets), [wallets]);

	const availableNetworks = useMemo(() => [...groupedByNetwork.keys()], [groupedByNetwork]);

	const filteredGroupedByNetwork = useMemo(() => {
		const filteredByDisplayTypeAndNetwork = filteredByDisplayType.filter((wallet) =>
			selectedNetworkIds.includes(wallet.network().id()),
		);
		return [...groupWalletsByNetwork(filteredByDisplayTypeAndNetwork).entries()];
	}, [filteredByDisplayType, selectedNetworkIds]);

	const hasMatchingOtherNetworks = useMemo(
		() => filteredByDisplayType.some((wallet) => !selectedNetworkIds.includes(wallet.network().id())),
		[filteredByDisplayType, selectedNetworkIds],
	);

	return {
		availableNetworks,
		availableWallets: wallets,
		filteredWalletsGroupedByNetwork: filteredGroupedByNetwork,
		hasWalletsMatchingOtherNetworks: hasMatchingOtherNetworks,
		walletsGroupedByNetwork: groupedByNetwork,
	};
};
