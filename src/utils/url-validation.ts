import { matchPath } from "react-router-dom";
import { ProfilePaths } from "@/router/paths";

export const isKnownPath = (url: string) =>
	Object.values(ProfilePaths).some((path) => matchPath({ path }, url)?.isExact);

export const isAllowedUrl = (url: string) => {
	const allowedUrls: string[] = [ProfilePaths.Welcome, ProfilePaths.CreateProfile, ProfilePaths.ImportProfile];
	return allowedUrls.includes(url);
};

export const isValidUrl = (url: string) => {
	try {
		new URL(url);
	} catch {
		return false;
	}

	return true;
};
