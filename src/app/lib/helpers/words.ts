export const words = (value: string): string[] | null =>
	value.match(
		/[A-Z\u00C0-\u00D6\u00D8-\u00DE]?[a-z\u00DF-\u00F6\u00F8-\u00FF]+|[A-Z\u00C0-\u00D6\u00D8-\u00DE]+(?![a-z\u00DF-\u00F6\u00F8-\u00FF])|\d+/g,
	);
