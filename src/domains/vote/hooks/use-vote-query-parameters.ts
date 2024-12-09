import { useEffect, useState, useMemo } from "react";
import { Contracts, Environment } from "@ardenthq/sdk-profiles";
import { Networks } from "@ardenthq/sdk";

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
	env,
	profile,
	network,
}: {
	env: Environment;
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
				env.delegates().all(network.coin(), network.id());
			} catch {
				await env.delegates().sync(profile, network.coin(), network.id());
			}

			if (unvoteValidators.length > 0 && unvotes.length === 0) {
				const unvotesList: Contracts.VoteRegistryItem[] = unvoteValidators?.map((unvote) => ({
					amount: unvote.amount,
					wallet: env.delegates().findByAddress(network.coin(), network.id(), unvote.validatorAddress),
				}));

				setUnvotes(unvotesList);
			}

			if (voteValidators.length > 0 && votes.length === 0) {
				const votesList: Contracts.VoteRegistryItem[] = voteValidators?.map((vote) => ({
					amount: vote.amount,
					wallet: env.delegates().findByAddress(network.coin(), network.id(), vote.validatorAddress),
				}));

				setVotes(votesList);
			}

			setIsLoading(false);
		};

		updateValidators();
	}, [env, voteValidators, votes, unvoteValidators, unvotes]);

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
