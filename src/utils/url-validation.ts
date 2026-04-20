import { matchPath } from "react-router-dom";
import { ProfilePaths } from "@/router/paths";
import { getProfileFromUrl } from "@/utils/profile-utils";
import { Environment } from "@/app/lib/profiles";

export const isKnownPath = (url: string) =>
	Object.values(ProfilePaths).some((path) => matchPath({ end: true, path }, url) !== null);

// This function checks if profile has wallets before viewing tokens, exchange and votes pages
export const isDisabledUrl = (url: string, env: Environment) => {
	if (!url.startsWith("/profiles")) {
		return false;
	}

	const profile = getProfileFromUrl(env, url);

	// Corrupted profile url. Force redirect to welcome page.
	if (!profile) {
		return false;
	}

	if (profile.wallets().count() > 0) {
		return false;
	}

	const match = [ProfilePaths.Tokens, ProfilePaths.Exchange, ProfilePaths.Votes].some(
		(path) => matchPath({ end: true, path }, url) !== null,
	);

	return match ? profile.id() : undefined;
};

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
