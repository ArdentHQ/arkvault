import { useHistory } from "react-router-dom";

import { Contracts } from "@ardenthq/sdk-profiles";
import { useCallback } from "react";
import { useEnvironmentContext } from "@/app/contexts";
import { useQueryParameters } from "@/app/hooks/use-query-parameters";
import { useSearchParametersValidation } from "@/app/hooks/use-search-parameters-validation";

export const useDeeplink = () => {
	const { env } = useEnvironmentContext();

	const history = useHistory();
	const queryParameters = useQueryParameters();
	const { methods, pages, buildSearchParametersError, validateSearchParameters } = useSearchParametersValidation();

	const isDeeplink = useCallback(
		() => queryParameters.has("method") || queryParameters.has("page"),
		[queryParameters],
	);

	const handleDeepLink = (profile: Contracts.IProfile) => {
		if (queryParameters.has("page")) {
			const page = pages[queryParameters.get("page") as string];
			return history.push(page.path({ env, profile, searchParameters: queryParameters }));
		} else {
			const method = methods[queryParameters.get("method") as string];
			return history.push(method.path({ env, profile, searchParameters: queryParameters }));
		}
	};

	const validateDeeplink = async (profile: Contracts.IProfile) => {
		const result = await validateSearchParameters(profile, env, queryParameters);

		if (result?.error) {
			return buildSearchParametersError(result.error);
		}
	};

	return {
		handleDeepLink,
		isDeeplink,
		validateDeeplink,
	};
};

export default useDeeplink;
