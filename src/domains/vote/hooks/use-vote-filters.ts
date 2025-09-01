import { Contracts } from "@/app/lib/profiles";
import { useMemo, useState } from "react";
import { useWalletAlias } from "@/app/hooks";
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
	wallet?: Contracts.IReadWriteWallet;
	hasWalletId: boolean;
}) => {
	const { getWalletAlias } = useWalletAlias();
	const walletAddress = useMemo(() => (hasWalletId ? wallet!.address() : ""), [hasWalletId, wallet]);
	const walletMaxVotes = useMemo(
		() => (hasWalletId ? wallet!.network().maximumVotesPerWallet() : undefined),
		[hasWalletId, wallet],
	);
	const { activeNetwork } = useActiveNetwork({ profile });

	const [voteFilter, setVoteFilter] = useState<FilterOption>(filter);
	const [selectedAddress, setSelectedAddress] = useState(walletAddress);
	const [searchQuery, setSearchQuery] = useState("");
	const [maxVotes, setMaxVotes] = useState(walletMaxVotes);

	const walletsCount = profile.wallets().count();

	const wallets = useMemo(
		() =>
			sortWallets(
				profile
					.wallets()
					.values()
					.filter((wallet) => wallet.network().id() === activeNetwork.id()),
			),
		[profile, activeNetwork, walletsCount],
	);

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
	};
};
