import { isValidProfileUrl } from "@/utils/profile-utils";
import { ProfilePaths } from "@/router/paths";
import { Middleware, MiddlewareParameters } from "@/router/router.types";
import { isAllowedUrl, isKnownPath } from "@/utils/url-validation";
import { redirect } from "react-router-dom";

export class UrlValidationMiddleware implements Middleware {
	handler({ env, location }: MiddlewareParameters): boolean {
		if (!isKnownPath(location.pathname)) {
			redirect(ProfilePaths.Welcome);
			return false;
		}

		if (isAllowedUrl(location.pathname)) {
			return true;
		}

		if (!isValidProfileUrl(env, location.pathname)) {
			redirect(ProfilePaths.Welcome);
			return false;
		}

		return true;
	}
}
