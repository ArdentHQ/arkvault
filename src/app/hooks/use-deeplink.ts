import { useHistory } from "react-router-dom";

import { Contracts } from "@ardenthq/sdk-profiles";
import { useEnvironmentContext } from "@/app/contexts";
import { useQueryParameters } from "@/app/hooks/use-query-parameters";
import { useSearchParametersValidation } from "@/app/hooks/use-search-parameters-validation";

export const useDeeplink = () => {
	const { env } = useEnvironmentContext();

	const history = useHistory();
	const queryParameters = useQueryParameters();
	const { methods, validateSearchParameters } = useSearchParametersValidation();

	const isDeeplink = () => queryParameters.has("method");

	const handleDeepLink = (profile: Contracts.IProfile) => {
		const method = methods[queryParameters.get("method") as string];
		return history.push(method.path({ env, profile, searchParameters: queryParameters }));
	};

	const validateDeeplink = async (profile: Contracts.IProfile) => {
		try {
			await validateSearchParameters(profile, env, queryParameters);
		} catch (error) {
			return `Invalid URI: ${error.message}`;
		}
	};

	return {
		handleDeepLink,
		isDeeplink,
		validateDeeplink,
	};
};

export default useDeeplink;
