import { cloneArray } from "./clone-array.js";

export const shuffle = <T>(iterable: T[]): T[] => {
	const shuffledValues: T[] = cloneArray<T>(iterable);

	for (let index = 0; index < shuffledValues.length; index++) {
		const rand: number = Math.floor(Math.random() * (index + 1));
		const value: T = shuffledValues[index];

		shuffledValues[index] = shuffledValues[rand];
		shuffledValues[rand] = value;
	}

	return shuffledValues;
};
