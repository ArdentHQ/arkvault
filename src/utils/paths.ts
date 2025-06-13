export function getUrlParameter(pathname: string, index: number): string {
	const parts = pathname.split("/").filter(Boolean);
	const part = parts.at(index)
	if (!part) {
		throw new Error(
			`Parameter is missing at ${index} in path "${pathname}".`
		);
	}
	return part;
}
