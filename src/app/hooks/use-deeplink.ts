import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { matchPath, useHistory, useLocation } from "react-router-dom";

import { Contracts } from "@ardenthq/sdk-profiles";
import { useEnvironmentContext } from "@/app/contexts";
import { toasts } from "@/app/services";
import { ProfilePaths } from "@/router/paths";
import { useQueryParameters } from "@/app/hooks/use-query-parameters";
import { useSearchParametersValidation } from "@/app/hooks/use-search-parameters-validation";

export const useDeeplink = () => {
	const { env } = useEnvironmentContext();
	const { t } = useTranslation();

	const [profile, setProfile] = useState<Contracts.IProfile | undefined>();
	const isProfileRestored = profile?.status().isRestored();

	const history = useHistory();
	const location = useLocation();
	const queryParameters = useQueryParameters();
	const { methods, validateSearchParameters } = useSearchParametersValidation();
	const [deepLink, setDeepLink] = useState<URLSearchParams | undefined>();

	const navigate = useCallback((url: string, deeplinkSchema?: any) => history.push(url, deeplinkSchema), [history]);

	/** useActiveProfile has no effect here because it is not within the routes */
	const verifyProfile = useCallback(() => {
		const match = matchPath<{ profileId: string }>(history.location.pathname, {
			path: "/profiles/:profileId",
		});

		if (!match) {
			return toasts.warning(t("COMMON.SELECT_A_PROFILE"), { delay: 500 });
		}

		setProfile(env.profiles().findById(match.params.profileId));
	}, [env, history.location.pathname, t]);

	const handleDeepLink = useCallback(
		async (searchParameters: URLSearchParams) => {
			if (!profile) {
				return verifyProfile();
			}

			if (!isProfileRestored) {
				return;
			}

			try {
				await validateSearchParameters(profile, env, searchParameters);

				const method = methods[searchParameters.get("method") as string];

				return navigate(method.path({ profile, env, searchParameters }));
			} catch (error) {
				toasts.error(`Invalid URI: ${error.message}`);
			} finally {
				setDeepLink(undefined);
				setProfile(undefined);
			}
		},
		[profile, isProfileRestored, verifyProfile, navigate],
	);

	const onLocationChange = useCallback(() => {
		// @ts-ignore
		const pathname = location.pathname || location.location?.pathname;

		if ([ProfilePaths.CreateProfile, ProfilePaths.ImportProfile].includes(pathname)) {
			return setDeepLink(undefined);
		}

		if (pathname === ProfilePaths.Welcome && location.search) {
			setDeepLink(queryParameters);
			return handleDeepLink(queryParameters);
		}

		if (pathname !== ProfilePaths.Welcome && deepLink) {
			handleDeepLink(deepLink);
		}
	}, [handleDeepLink, location, queryParameters]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		onLocationChange();
	}, [location, isProfileRestored]); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useDeeplink;
