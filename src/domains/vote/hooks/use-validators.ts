import { Contracts, Environment } from "@/app/lib/profiles";
import { useCallback, useMemo, useState } from "react";

import { FilterOption } from "@/domains/vote/components/VotesFilter";
import { assertWallet } from "@/utils/assertions";

export const useValidators = ({
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
	const [validators, setValidators] = useState<Contracts.IReadOnlyWallet[]>([]);
	const [votes, setVotes] = useState<Contracts.VoteRegistryItem[]>([]);
	const [isLoadingValidators, setIsLoadingValidators] = useState(false);

	const currentVotes = useMemo(
		() => votes.filter((vote) => validators.some((validator) => vote.wallet?.address() === validator.address())),
		[votes, validators],
	);

	const fetchValidators = useCallback(
		async (wallet) => {
			setIsLoadingValidators(true);
			await profile.validators().sync(wallet.networkId());
			const validators = profile.validators().all(wallet.networkId());
			await profile.usernames().syncUsernames(validators.map((validator) => validator.address()));

			setValidators(validators);
			setIsLoadingValidators(false);
		},
		[env, profile],
	);

	const filteredValidatorsVotes = useMemo(() => {
		if (voteFilter === "all") {
			return validators.filter((validator) => !validator.isResignedValidator());
		}

		const voteWallets: Contracts.IReadOnlyWallet[] = [];

		for (const { wallet } of currentVotes) {
			if (wallet && !wallet.isResignedValidator()) {
				voteWallets.push(wallet);
			}
		}

		return voteWallets;
	}, [validators, currentVotes, voteFilter]);

	const filteredValidators = useMemo(() => {
		if (searchQuery.length === 0) {
			return filteredValidatorsVotes;
		}

		const query = searchQuery.toLowerCase();
		return filteredValidatorsVotes.filter(
			(validator) =>
				validator.address().toLowerCase().includes(query) ||
				validator.username()?.toLowerCase()?.includes(query),
		);
	}, [filteredValidatorsVotes, searchQuery]);

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

	const resignedValidatorVotes = useMemo(
		() => currentVotes.filter(({ wallet }) => wallet?.isResignedValidator()),
		[currentVotes],
	);

	return {
		currentVotes,
		fetchValidators,
		fetchVotes,
		filteredValidators,
		isLoadingValidators,
		resignedValidatorVotes,
		validators,
		votes,
	};
};
