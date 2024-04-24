import { sample } from "@ardenthq/sdk-helpers";

const randomWordPositions = (length: number): number[] => {
	const positions: number[] = [...Array.from({ length }).keys()];
	const result: number[] = [];

	while (result.length < 3) {
		const randomNumber = sample(positions) + 1;

		if (result.includes(randomNumber)) {
			continue;
		}

		result.push(randomNumber);
	}

	return result.sort((a, b) => a - b);
};

export { randomWordPositions };
