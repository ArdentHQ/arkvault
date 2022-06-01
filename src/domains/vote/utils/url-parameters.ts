import { VoteDelegateProperties } from "@/domains/vote/components/DelegateTable/DelegateTable.contracts";

export type ParameterNameProperties = "vote" | "unvote";

export const appendParameters = (
	parameters: URLSearchParams,
	parameterName: ParameterNameProperties,
	votes: VoteDelegateProperties[],
) => {
	for (const { delegateAddress, amount } of votes) {
		parameters.append(parameterName, `${delegateAddress}, ${amount}`);
	}
};

export const getParameters = (
	parameters: URLSearchParams,
	parameterName: ParameterNameProperties,
): VoteDelegateProperties[] =>
	parameters.getAll(parameterName)?.map((vote) => {
		const voteDelegate = vote.split(",");

		return {
			amount: +voteDelegate[1],
			delegateAddress: voteDelegate[0],
		};
	});
