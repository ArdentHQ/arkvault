export const ensureTrailingSlash = (url: string): string => {
	const lastCharacter = url.slice(-1);

	if (lastCharacter != "/") {
		url = url + "/";
	}

	return url;
};
