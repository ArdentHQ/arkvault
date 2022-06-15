import { isEmptyObject } from "@ardenthq/sdk-helpers";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useMemo, useState } from "react";

import { useNetworks, useWalletAlias } from "@/app/hooks";
import { useWalletFilters } from "@/domains/dashboard/components/FilterWallets";
import { FilterOption } from "@/domains/vote/components/VotesFilter";
import { useAvailableNetworks } from "@/domains/wallet/hooks";

export const useVoteFilters = ({
	profile,
	filter,
	wallet,
	hasWalletId,
}: {
	profile: Contracts.IProfile;
	filter: FilterOption;
	wallet: Contracts.IReadWriteWallet;
	hasWalletId: boolean;
}) => {
	const { defaultConfiguration } = useWalletFilters({ profile });
	const basicNetworks = useNetworks(profile);
	const { getWalletAlias } = useWalletAlias();
	const walletAddress = useMemo(() => (hasWalletId ? wallet.address() : ""), [hasWalletId, wallet]);
	const walletNetwork = useMemo(() => (hasWalletId ? wallet.network().id() : ""), [hasWalletId, wallet]);
	const walletMaxVotes = useMemo(
		() => (hasWalletId ? wallet.network().maximumVotesPerWallet() : undefined),
		[hasWalletId, wallet],
	);

	const [walletsDisplayType, setWalletsDisplayType] = useState(defaultConfiguration.walletsDisplayType);
	const [selectedNetworkIds, setSelectedNetworkIds] = useState(defaultConfiguration.selectedNetworkIds);
	const [voteFilter, setVoteFilter] = useState<FilterOption>(filter);
	const [selectedAddress, setSelectedAddress] = useState(walletAddress);
	const [selectedNetwork, setSelectedNetwork] = useState(walletNetwork);
	const [searchQuery, setSearchQuery] = useState("");
	const [maxVotes, setMaxVotes] = useState(walletMaxVotes);
	const availableNetworks = useAvailableNetworks({ profile });

	const networks = useMemo(
		() =>
			basicNetworks.map((network) => ({
				isSelected: selectedNetworkIds.includes(network.id()),
				network,
			})),
		[basicNetworks, selectedNetworkIds],
	);

	const isFilterChanged = useMemo(() => {
		if (walletsDisplayType !== defaultConfiguration.walletsDisplayType) {
			return true;
		}

		return selectedNetworkIds.length < defaultConfiguration.selectedNetworkIds.length;
	}, [walletsDisplayType, selectedNetworkIds, defaultConfiguration]);

	const filterProperties = {
		networks,
		onChange: (key: string, value: any) => {
			if (key === "walletsDisplayType") {
				setWalletsDisplayType(value);
			}
			if (key === "selectedNetworkIds") {
				setSelectedNetworkIds(value);
			}
		},
		selectedNetworkIds,
		walletsDisplayType,
	};

	const walletsByCoin = useMemo(() => {
		const usedWallets = profile
			.wallets()
			.values()
			.filter((wallet) => availableNetworks.some((network) => wallet.network().id() === network.id()));

		const mappedWallets: Record<string, Contracts.IReadWriteWallet[]> = {};

		for (const wallet of usedWallets) {
			const networkId = wallet.network().id();

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (!mappedWallets[networkId]) {
				mappedWallets[networkId] = [];
			}

			if (!selectedNetworkIds.includes(networkId)) {
				continue;
			}

			if (walletsDisplayType === "starred" && !wallet.isStarred()) {
				continue;
			}

			if (walletsDisplayType === "ledger" && !wallet.isLedger()) {
				continue;
			}

			mappedWallets[networkId].push(wallet);
		}

		return mappedWallets;
	}, [profile, selectedNetworkIds, walletsDisplayType]);

	const filteredWalletsByCoin = useMemo(() => {
		if (searchQuery.length === 0) {
			return walletsByCoin;
		}

		const query = searchQuery.toLowerCase();

		const mappedWallets: Record<string, Contracts.IReadWriteWallet[]> = {};

		for (const coin of Object.keys(walletsByCoin)) {
			mappedWallets[coin] = Object.values(walletsByCoin[coin]).filter((wallet: Contracts.IReadWriteWallet) => {
				const { alias } = getWalletAlias({
					address: wallet.address(),
					network: wallet.network(),
					profile,
				});

				return wallet.address().toLowerCase().includes(query) || alias?.toLowerCase()?.includes(query);
			});
		}

		return mappedWallets;
	}, [getWalletAlias, profile, searchQuery, walletsByCoin]);

	const hasEmptyResults = Object.keys(filteredWalletsByCoin).every(
		(coin: string) => filteredWalletsByCoin[coin].length === 0,
	);

	const hasWallets = !isEmptyObject(walletsByCoin);

	return {
		filterProperties,
		filteredWalletsByCoin,
		hasEmptyResults,
		hasWallets,
		isFilterChanged,
		maxVotes,
		networks,
		searchQuery,
		selectedAddress,
		selectedNetwork,
		selectedNetworkIds,
		setMaxVotes,
		setSearchQuery,
		setSelectedAddress,
		setSelectedNetwork,
		setVoteFilter,
		voteFilter,
		walletsByCoin,
		walletsDisplayType,
	};
};
