import { Contracts } from "@ardenthq/sdk-profiles";
import { useMemo, useState } from "react";
import { useWalletAlias } from "@/app/hooks";
import { useWalletFilters } from "@/domains/dashboard/components/FilterWallets/hooks";
import { FilterOption } from "@/domains/vote/components/VotesFilter";
import { sortWallets } from "@/utils/wallet-utils";
import { useActiveNetwork } from "@/app/hooks/use-active-network";

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
	const { getWalletAlias } = useWalletAlias();
	const walletAddress = useMemo(() => (hasWalletId ? wallet.address() : ""), [hasWalletId, wallet]);
	const walletMaxVotes = useMemo(
		() => (hasWalletId ? wallet.network().maximumVotesPerWallet() : undefined),
		[hasWalletId, wallet],
	);
	const { activeNetwork } = useActiveNetwork({ profile });

	const [walletsDisplayType, setWalletsDisplayType] = useState(defaultConfiguration.walletsDisplayType);
	const [voteFilter, setVoteFilter] = useState<FilterOption>(filter);
	const [selectedAddress, setSelectedAddress] = useState(walletAddress);
	const [searchQuery, setSearchQuery] = useState("");
	const [maxVotes, setMaxVotes] = useState(walletMaxVotes);

	const filterFilters = {
		onChange: (key: string, value: any) => {
			if (key === "walletsDisplayType") {
				setWalletsDisplayType(value);
			}
		},
		walletsDisplayType,
	};

	const wallets = useMemo(() => {
		const usedWallets = sortWallets(
			profile
				.wallets()
				.values()
				.filter((wallet) => wallet.network().id() === activeNetwork.id()),
		);

		return usedWallets.filter((wallet) => {
			if (walletsDisplayType === "starred" && !wallet.isStarred()) {
				return false;
			}
			if (walletsDisplayType === "ledger" && !wallet.isLedger()) {
				return false;
			}
			return true;
		});
	}, [profile, walletsDisplayType, activeNetwork]);

	const filteredWallets = useMemo(() => {
		if (searchQuery.length === 0) {
			return wallets;
		}

		const query = searchQuery.toLowerCase();
		return wallets.filter((wallet: Contracts.IReadWriteWallet) => {
			const { alias } = getWalletAlias({
				address: wallet.address(),
				network: wallet.network(),
				profile,
			});
			return wallet.address().toLowerCase().includes(query) || alias?.toLowerCase().includes(query);
		});
	}, [getWalletAlias, profile, searchQuery, wallets]);

	const hasEmptyResults = filteredWallets.length === 0;
	const hasWallets = wallets.length > 0;

	return {
		filterFilters,
		filteredWallets,
		hasEmptyResults,
		hasWallets,
		maxVotes,
		searchQuery,
		selectedAddress,
		setMaxVotes,
		setSearchQuery,
		setSelectedAddress,
		setVoteFilter,
		voteFilter,
		wallets,
		walletsDisplayType,
	};
};
