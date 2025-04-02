import { compoundWords } from "./compound-words.js";

export const constantCase = (value: string): string | undefined =>
	compoundWords(
		value,
		(result: string, word: string, index: number) => result + (index ? "_" : "") + word.toUpperCase(),
	);
