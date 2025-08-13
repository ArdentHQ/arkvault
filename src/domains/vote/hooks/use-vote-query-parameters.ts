import { useEffect, useState, useMemo } from "react";
import { Contracts } from "@/app/lib/profiles";
import { Networks } from "@/app/lib/mainsail";

import { useQueryParameters } from "@/app/hooks";
import { FilterOption } from "@/domains/vote/components/VotesFilter";
import { getParameters } from "@/domains/vote/utils/url-parameters";

export const useVoteQueryParameters = () => {
	const queryParameters = useQueryParameters();
	const unvoteValidators = getParameters(queryParameters, "unvote");
	const voteValidators = getParameters(queryParameters, "vote");
	const filter = (queryParameters.get("filter") || "all") as FilterOption;

	return useMemo(() => ({ filter, unvoteValidators, voteValidators }), [filter, unvoteValidators, voteValidators]);
};

export const useValidatorsFromURL = ({
	profile,
	network,
}: {
	profile: Contracts.IProfile;
	network: Networks.Network;
}) => {
	const { voteValidators, unvoteValidators } = useVoteQueryParameters();

	const [votes, setVotes] = useState<Contracts.VoteRegistryItem[]>([]);
	const [unvotes, setUnvotes] = useState<Contracts.VoteRegistryItem[]>([]);

	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const updateValidators = async () => {
			setIsLoading(true);

			try {
				profile.validators().all(network.id());
			} catch {
				await profile.validators().sync(network.id());
			}

			if (unvoteValidators.length > 0 && unvotes.length === 0) {
				const unvotesList: Contracts.VoteRegistryItem[] = unvoteValidators?.map((unvote) => ({
					amount: unvote.amount,
					wallet: profile.validators().findByAddress(network.id(), unvote.validatorAddress),
				}));

				setUnvotes(unvotesList);
			}

			if (voteValidators.length > 0 && votes.length === 0) {
				const votesList: Contracts.VoteRegistryItem[] = voteValidators?.map((vote) => ({
					amount: vote.amount,
					wallet: profile.validators().findByAddress(network.id(), vote.validatorAddress),
				}));

				setVotes(votesList);
			}

			setIsLoading(false);
		};

		updateValidators();
	}, [profile, voteValidators, votes, unvoteValidators, unvotes]);

	return {
		isLoading,
		setUnvotes,
		setVotes,
		unvoteValidators,
		unvotes,
		voteValidators,
		votes,
	};
};
