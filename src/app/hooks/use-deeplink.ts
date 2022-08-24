import { useCallback } from "react";
import { useHistory } from "react-router-dom";

import { Contracts } from "@ardenthq/sdk-profiles";
import { useEnvironmentContext } from "@/app/contexts";
import { toasts } from "@/app/services";
import { useQueryParameters } from "@/app/hooks/use-query-parameters";
import { useSearchParametersValidation } from "@/app/hooks/use-search-parameters-validation";

export const useDeeplink = () => {
	const { env } = useEnvironmentContext();

	const history = useHistory();
	const queryParameters = useQueryParameters();
	const { methods, validateSearchParameters } = useSearchParametersValidation();

	const navigate = useCallback((url: string, deeplinkSchema?: any) => history.push(url, deeplinkSchema), [history]);
	const isDeeplink = () => queryParameters.has("method");

	const handleDeepLink = useCallback(
		async (profile: Contracts.IProfile) => {
			try {
				await validateSearchParameters(profile, env, queryParameters);

				const method = methods[queryParameters.get("method") as string];

				return navigate(method.path({ env, profile, searchParameters: queryParameters }));
			} catch (error) {
				toasts.error(`Invalid URI: ${error.message}`, { delay: 5000 });
			}
		},
		[navigate],
	);

	return {
		handleDeepLink,
		isDeeplink,
	};
};

export default useDeeplink;
