import { useHistory } from "react-router-dom";

import { Contracts } from "@ardenthq/sdk-profiles";
import { useState } from "react";
import { useEnvironmentContext } from "@/app/contexts";
import { useQueryParameters } from "@/app/hooks/use-query-parameters";
import { useSearchParametersValidation } from "@/app/hooks/use-search-parameters-validation";

export const useDeeplink = () => {
	const { env } = useEnvironmentContext();

	const history = useHistory();
	const queryParameters = useQueryParameters();
	const { methods, validateSearchParameters } = useSearchParametersValidation();
	const [deeplinkFailed, setDeeplinkFailed] = useState(false);

	const isDeeplink = () => queryParameters.has("method");

	const handleDeepLink = (profile: Contracts.IProfile) => {
		const method = methods[queryParameters.get("method") as string];
		return history.push(method.path({ env, profile, searchParameters: queryParameters }));
	};

	const validateDeeplink = async (profile: Contracts.IProfile) => {
		try {
			await validateSearchParameters(profile, env, queryParameters);
		} catch (error) {
			setDeeplinkFailed(true);

			history.push("/");

			return `Invalid URI: ${error.message}`;
		}
	};

	return {
		deeplinkFailed,
		handleDeepLink,
		isDeeplink,
		validateDeeplink,
	};
};

export default useDeeplink;
