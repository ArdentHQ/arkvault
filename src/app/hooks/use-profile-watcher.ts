import { useMemo } from "react";
import { matchPath, useLocation } from "react-router-dom";
import { useEnvironmentContext } from "@/app/contexts";
import { getProfileById } from "@/utils/profile-utils";

export const useProfileWatcher = () => {
	const location = useLocation();

	const { env } = useEnvironmentContext();

	const pathname = (location as any).location?.pathname || location.pathname;
	const match = useMemo(() => matchPath(pathname, { path: "/profiles/:profileId" }), [pathname]);
	const profileId = (match?.params as any)?.profileId;
	const allProfilesCount = env.profiles().count();

	return useMemo(() => getProfileById(env, profileId), [profileId, env, allProfilesCount]); // eslint-disable-line react-hooks/exhaustive-deps
};
