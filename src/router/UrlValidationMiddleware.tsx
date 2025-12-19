import { isValidProfileUrl } from "@/utils/profile-utils";
import { ProfilePaths } from "@/router/paths";
import { Middleware, MiddlewareParameters } from "@/router/router.types";
import { isAllowedUrl, isDisabledUrl, isKnownPath } from "@/utils/url-validation";
import { generatePath } from "react-router-dom";

export class UrlValidationMiddleware implements Middleware {
	handler({ navigate, env, location }: MiddlewareParameters): boolean {
		if (!isKnownPath(location.pathname)) {
			navigate(ProfilePaths.Welcome);
			return false;
		}

		if (isAllowedUrl(location.pathname)) {
			return true;
		}

		if (!isValidProfileUrl(env, location.pathname)) {
			navigate(ProfilePaths.Welcome);
			return false;
		}

		const profileId = isDisabledUrl(location.pathname, env);
		if (profileId) {
			navigate(generatePath(ProfilePaths.Dashboard, { profileId }));
		}

		return true;
	}
}
