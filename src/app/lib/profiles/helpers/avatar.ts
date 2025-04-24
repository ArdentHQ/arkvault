import seedrandom from "seedrandom";

const COLORS = [
	"4381C0",
	"45A2EB",
	"00B2AA",
	"6E6CEF",
	"062A50",
	"289548",
	"FC9F0F",
	"2A64E6",
	"3898F9",
	"5CA481",
	"B6D7F8",
	"5EB8FC",
	"EF7C6D",
	"B0DBBC",
	"FA9EDC",
];

const memory: Record<string, string> = {};

export class Avatar {
	public static make(seed: string): string {
		if (memory[seed] !== undefined) {
			return memory[seed];
		}

		const rng = seedrandom(seed);
		const colorIndex = Math.floor(rng() * COLORS.length);
		const selectedColor = COLORS[colorIndex];

		const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#${selectedColor}"/></svg>`;

		memory[seed] = svg;
		return svg;
	}
}
