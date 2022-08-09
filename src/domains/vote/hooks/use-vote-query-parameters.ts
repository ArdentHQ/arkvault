import { useEffect, useState, useMemo } from "react";
import { Contracts, Environment } from "@ardenthq/sdk-profiles";
import { Networks } from "@ardenthq/sdk";

import { useQueryParameters } from "@/app/hooks";
import { FilterOption } from "@/domains/vote/components/VotesFilter";
import { getParameters } from "@/domains/vote/utils/url-parameters";

export const useVoteQueryParameters = () => {
	const queryParameters = useQueryParameters();
	const unvoteDelegates = getParameters(queryParameters, "unvote");
	const voteDelegates = getParameters(queryParameters, "vote");
	const filter = (queryParameters.get("filter") || "all") as FilterOption;

	return useMemo(() => ({ filter, unvoteDelegates, voteDelegates }), [filter, unvoteDelegates, voteDelegates]);
};

export const useDelegatesFromURL = ({
	env,
	profile,
	network,
}: {
	env: Environment;
	profile: Contracts.IProfile;
	network: Networks.Network;
}) => {
	const { voteDelegates, unvoteDelegates } = useVoteQueryParameters();

	const [votes, setVotes] = useState<Contracts.VoteRegistryItem[]>([]);
	const [unvotes, setUnvotes] = useState<Contracts.VoteRegistryItem[]>([]);

	const [isLoading, setIsLoading] = useState(false);

	const fetchDelegates = async () => {
		try {
			env.delegates().all(network.coin(), network.id());
		} catch {
			await env.delegates().sync(profile, network.coin(), network.id());
		}
	};

	useEffect(() => {
		const updateDelegates = async () => {
			setIsLoading(true);
			await fetchDelegates();

			if (unvoteDelegates.length > 0 && unvotes.length === 0) {
				const unvotesList: Contracts.VoteRegistryItem[] = unvoteDelegates?.map((unvote) => ({
					amount: unvote.amount,
					wallet: env.delegates().findByAddress(network.coin(), network.id(), unvote.delegateAddress),
				}));

				setUnvotes(unvotesList);
			}

			if (voteDelegates.length > 0 && votes.length === 0) {
				const votesList: Contracts.VoteRegistryItem[] = voteDelegates?.map((vote) => ({
					amount: vote.amount,
					wallet: env.delegates().findByAddress(network.coin(), network.id(), vote.delegateAddress),
				}));

				setVotes(votesList);
			}

			setIsLoading(false);
		};

		updateDelegates();
	}, [env, voteDelegates, votes, unvoteDelegates, unvotes]);

	return {
		isLoading,
		unvoteDelegates,
		unvotes,
		voteDelegates,
		votes,
	};
};
