import { Contracts, Environment } from "@payvo/sdk-profiles";
import { useCallback, useMemo, useState } from "react";

import { FilterOption } from "@/domains/vote/components/VotesFilter";
import { assertWallet } from "@/utils/assertions";

export const useDelegates = ({
	env,
	profile,
	searchQuery,
	voteFilter,
}: {
	env: Environment;
	profile: Contracts.IProfile;
	searchQuery: string;
	voteFilter: FilterOption;
}) => {
	const [delegates, setDelegates] = useState<Contracts.IReadOnlyWallet[]>([]);
	const [votes, setVotes] = useState<Contracts.VoteRegistryItem[]>([]);
	const [isLoadingDelegates, setIsLoadingDelegates] = useState(false);

	const currentVotes = useMemo(
		() => votes.filter((vote) => delegates.some((delegate) => vote.wallet?.address() === delegate.address())),
		[votes, delegates],
	);

	const fetchDelegates = useCallback(
		async (wallet) => {
			setIsLoadingDelegates(true);
			await env.delegates().sync(profile, wallet.coinId(), wallet.networkId());
			const delegates = env.delegates().all(wallet.coinId(), wallet.networkId());

			setDelegates(delegates);
			setIsLoadingDelegates(false);
		},
		[env, profile],
	);

	const filteredDelegatesVotes = useMemo(() => {
		if (voteFilter === "all") {
			return delegates.filter((delegate) => !delegate.isResignedDelegate());
		}

		const voteWallets: Contracts.IReadOnlyWallet[] = [];

		for (const { wallet } of currentVotes) {
			if (wallet && !wallet.isResignedDelegate()) {
				voteWallets.push(wallet);
			}
		}

		return voteWallets;
	}, [delegates, currentVotes, voteFilter]);

	const filteredDelegates = useMemo(() => {
		if (searchQuery.length === 0) {
			return filteredDelegatesVotes;
		}

		const query = searchQuery.toLowerCase();
		return filteredDelegatesVotes.filter(
			(delegate) =>
				delegate.address().toLowerCase().includes(query) || delegate.username()?.toLowerCase()?.includes(query),
		);
	}, [filteredDelegatesVotes, searchQuery]);

	const fetchVotes = useCallback(
		(address, network) => {
			const wallet = profile.wallets().findByAddressWithNetwork(address, network);

			assertWallet(wallet);

			let votes: Contracts.VoteRegistryItem[];

			try {
				votes = wallet.voting().current();
			} catch {
				votes = [];
			}

			setVotes(votes);
		},
		[profile],
	);

	const resignedDelegateVotes = useMemo(
		() => currentVotes.filter(({ wallet }) => wallet?.isResignedDelegate()),
		[currentVotes],
	);

	return {
		currentVotes,
		delegates,
		fetchDelegates,
		fetchVotes,
		filteredDelegates,
		isLoadingDelegates,
		resignedDelegateVotes,
		votes,
	};
};
