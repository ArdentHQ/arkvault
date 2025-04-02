import { mapArray } from "./map-array.js";
import { reduceArray } from "./reduce-array.js";
import { words } from "./words.js";

export const compoundWords = (
	value: string,
	transformer: (result: string, word: string, index: number) => string,
): string | undefined => {
	const segments: string[] | null = words(value);

	if (segments === null) {
		return undefined;
	}

	return reduceArray<string, string>(
		mapArray<string, string>(segments, (word: string) => word.toLowerCase()),
		transformer,
		"",
	);
};
