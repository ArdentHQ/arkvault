import { compoundWords } from "./compound-words.js";
import { upperFirst } from "./upper-first.js";

export const camelCase = (value: string): string | undefined =>
	compoundWords(value, (result: string, word: string, index: number) => result + (index ? upperFirst(word) : word));
