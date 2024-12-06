import { VoteValidatorProperties } from "@/domains/vote/components/ValidatorsTable/ValidatorsTable.contracts";

export type ParameterNameProperties = "vote" | "unvote";

export const appendParameters = (
	parameters: URLSearchParams,
	parameterName: ParameterNameProperties,
	votes: VoteValidatorProperties[],
) => {
	for (const { validatorAddress, amount } of votes) {
		parameters.append(parameterName, `${validatorAddress}, ${amount}`);
	}
};

export const getParameters = (
	parameters: URLSearchParams,
	parameterName: ParameterNameProperties,
): VoteValidatorProperties[] =>
	parameters.getAll(parameterName)?.map((vote) => {
		const voteDelegate = vote.split(",");

		return {
			amount: +voteDelegate[1],
			validatorAddress: voteDelegate[0],
		};
	});
