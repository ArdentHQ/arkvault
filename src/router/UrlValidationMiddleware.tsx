import { isValidProfileUrl } from "@/utils/profile-utils";
import { ProfilePaths } from "@/router/paths";
import { Middleware, MiddlewareParameters } from "@/router/router.types";
import { isAllowedUrl, isKnownPath } from "@/utils/url-validation";

export class UrlValidationMiddleware implements Middleware {
	handler({ env, location, navigate }: MiddlewareParameters): boolean {
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

		return true;
	}
}
