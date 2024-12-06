import { appendParameters, getParameters, ParameterNameProperties } from "./url-parameters";
import { VoteValidatorProperties } from "@/domains/vote/components/ValidatorsTable/ValidatorsTable.contracts";
import { data } from "@/tests/fixtures/coins/ark/devnet/delegates.json";

describe("#urlParameters", () => {
	describe.each(["vote", "unvote"])("append/get %s parameters", (parameterName) => {
		it(`should append ${parameterName} parameters`, () => {
			const parameters = new URLSearchParams();

			const votes: VoteValidatorProperties[] = [
				{
					amount: 10,
					validatorAddress: data[0].address,
				},
				{
					amount: 20,
					validatorAddress: data[1].address,
				},
			];

			appendParameters(parameters, parameterName as ParameterNameProperties, votes);

			expect(parameters.getAll(parameterName)).toHaveLength(2);
			expect(parameters.getAll(parameterName)[0]).toBe(`${data[0].address}, 10`);
			expect(parameters.getAll(parameterName)[1]).toBe(`${data[1].address}, 20`);
		});

		it(`should get ${parameterName} parameters`, () => {
			const parameters = new URLSearchParams();

			const votes: VoteValidatorProperties[] = [
				{
					amount: 10,
					validatorAddress: data[0].address,
				},
				{
					amount: 20,
					validatorAddress: data[1].address,
				},
			];

			appendParameters(parameters, parameterName as ParameterNameProperties, votes);

			expect(getParameters(parameters, parameterName as ParameterNameProperties)).toMatchObject(votes);
		});
	});
});
