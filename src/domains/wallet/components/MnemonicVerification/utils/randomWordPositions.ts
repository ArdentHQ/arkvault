import { sample } from "@ardenthq/sdk-helpers";

const randomWordPositions = (length: number): number[] => {
	const positions: number[] = [...Array.from({ length }).keys()];
	const result: Set<number> = new Set();

	while (result.size < 3) {
		const randomNumber = sample(positions) + 1;
		result.add(randomNumber);
	}

	return [...result].sort((a, b) => a - b);
};

export { randomWordPositions };
