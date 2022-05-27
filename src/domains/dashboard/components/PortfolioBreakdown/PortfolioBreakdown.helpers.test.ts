import { getColor } from "./PortfolioBreakdown.helpers";
import { GRAPH_COLORS, GRAPH_COLORS_DARK } from "@/app/components/Graphs/Graphs.contracts";

describe("PortfolioBreakdown.helpers", () => {
	describe("getColor", () => {
		it.each([
			{
				colors: GRAPH_COLORS_DARK,
				isDarkMode: true,
			},
			{
				colors: GRAPH_COLORS,
				isDarkMode: false,
			},
		])("returns colors for the graphs (%s)", ({ colors, isDarkMode }) => {
			expect(getColor(0, isDarkMode)).toBe(colors[0]);
			expect(getColor(1, isDarkMode)).toBe(colors[1]);
			expect(getColor(2, isDarkMode)).toBe(colors[2]);
			expect(getColor(3, isDarkMode)).toBe(colors[3]);
			expect(getColor(4, isDarkMode)).toBe(colors[4]);

			expect(getColor(5, isDarkMode)).toBe(colors[5]);
			expect(getColor(6, isDarkMode)).toBe(colors[5]);
			expect(getColor(7, isDarkMode)).toBe(colors[5]);
			expect(getColor(8, isDarkMode)).toBe(colors[5]);
			expect(getColor(9, isDarkMode)).toBe(colors[5]);
		});
	});
});
