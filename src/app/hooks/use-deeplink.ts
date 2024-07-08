import {useNavigate} from "react-router-dom";

import { Contracts } from "@ardenthq/sdk-profiles";
import { useCallback } from "react";
import { useEnvironmentContext } from "@/app/contexts";
import { useQueryParameters } from "@/app/hooks/use-query-parameters";
import { useSearchParametersValidation } from "@/app/hooks/use-search-parameters-validation";

export const useDeeplink = () => {
	const { env } = useEnvironmentContext();

	const navigate = useNavigate();
	const queryParameters = useQueryParameters();
	const { methods, buildSearchParametersError, validateSearchParameters } = useSearchParametersValidation();

	const isDeeplink = useCallback(() => queryParameters.has("method"), [queryParameters]);

	const handleDeepLink = (profile: Contracts.IProfile) => {
		const method = methods[queryParameters.get("method") as string];
		return navigate(method.path({ env, profile, searchParameters: queryParameters }));
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
