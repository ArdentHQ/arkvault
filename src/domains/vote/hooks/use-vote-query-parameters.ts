import { useMemo } from "react";

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
